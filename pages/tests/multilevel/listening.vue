<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const isTestStarted = ref(sessionStorage.getItem("isTestStarted") === "true");
const startTime = ref(Number(sessionStorage.getItem("startTime")) || null);
const durationInSeconds = ref(null);
const remainingTime = ref(0);
const timerInterval = ref(null);
const selectedAnswers = ref(JSON.parse(sessionStorage.getItem("selectedAnswers")) || {});

const nextTestOrder = ["speaking", "reading", "writing"];

const { data, error } = await useFetch(
  "https://turantalim2.pythonanywhere.com/multilevel/test/",
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: { language: 2, level: "multilevel", test: "listening", exam_id: 1 },
  }
);

if (error.value) {
  alert("Test yuklanishda xatolik yuz berdi.");
  router.push("/tests/multilevel/");
}

const testInfo = computed(() => {
  const part = data.value?.part;
  return part
    ? {
        title: part.exam.title,
        duration: data.value.duration,
        level: part.level,
        language: part.language.name,
        partTitle: part.title,
      }
    : null;
});

const tests = computed(() =>
  data.value?.part.tests?.map((test) => ({
    id: test.id,
    title: test.title,
    audio: test.audio,
    questions: test.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    })),
  })) || []
);

// TIMER
const updateRemainingTime = () => {
  if (!startTime.value || !durationInSeconds.value) return;
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
  remainingTime.value = durationInSeconds.value - elapsed;
  if (remainingTime.value <= 0) {
    clearInterval(timerInterval.value);
    finishTest(); // Time tugagan bo‘lsa avtomatik yakunlash
  }
};

const startTimer = () => {
  updateRemainingTime();
  timerInterval.value = setInterval(updateRemainingTime, 1000);
};

onMounted(() => {
  localStorage.removeItem("testResults");

  if (!isTestStarted.value) {
    router.push("/tests/multilevel/");
    return;
  }

  const waitForData = setInterval(() => {
    if (testInfo.value) {
      clearInterval(waitForData);
      durationInSeconds.value = testInfo.value.duration * 60;

      if (!startTime.value) {
        startTime.value = Date.now();
        sessionStorage.setItem("startTime", startTime.value);
      }

      startTimer();
    }
  }, 100);
});

onUnmounted(() => {
  clearInterval(timerInterval.value);
});

// Javob tanlash
const selectAnswer = (questionId, optionId) => {
  selectedAnswers.value[questionId] = optionId;
  sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers.value));
};

// Testni yakunlash
const finishTest = async () => {
  if (!confirm("Testni yakunlaysizmi?")) return;
  clearInterval(timerInterval.value);

  const test_result_id = data.value?.test_result_id;
  if (!test_result_id) return alert("Test ID topilmadi.");

  const answers = Object.entries(selectedAnswers.value).map(([qId, optId]) => {
    const test = tests.value.find(t => t.questions.some(q => q.id === Number(qId)));
    const question = test?.questions.find(q => q.id === Number(qId));
    const option = question?.options.find(o => o.id === Number(optId));
    return {
      question: Number(qId),
      user_option: Number(optId),
      user_answer: option?.text || String(optId),
    };
  });

  try {
    const res = await fetch("https://turantalim2.pythonanywhere.com/multilevel/check-test/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ test_result_id, answers }),
    });

    if (!res.ok) return alert("Xatolik: " + (await res.text()));

    const result = await res.json();
    const correct = result.answers.filter(a => a.is_correct).length;
    const incorrect = result.answers.length - correct;

    const sectionTitle = testInfo.value?.partTitle.toLowerCase() || "unknown";
    const prevResults = JSON.parse(localStorage.getItem("testResults") || "{}");

    prevResults[sectionTitle] = {
      correct,
      incorrect,
      score: result.score,
      test_completed: result.test_completed,
    };
    localStorage.setItem("testResults", JSON.stringify(prevResults));

    // faqat kerakli datalar sessionStorage’da qoladi
    sessionStorage.setItem("isTestStarted", "true");
    sessionStorage.removeItem("startTime");
    sessionStorage.removeItem("selectedAnswers");

    alert(`✅ Test yakunlandi. To‘g‘ri: ${correct}, Xato: ${incorrect}`);

    const currentIndex = nextTestOrder.indexOf(sectionTitle);
    const nextSection = nextTestOrder[currentIndex + 1] || "result";

    setTimeout(() => {
      router.push(`/tests/multilevel/${nextSection}`);
    }, 500);
  } catch (err) {
    console.error(err);
    alert("Testni yakunlashda xatolik yuz berdi.");
  }
};
</script>





<template>
  <section class="w-full bg-[#DBEFFF] py-5 flex flex-col gap-5">
    <SharedTestTime
      v-if="testInfo"
      title="Dinleme"
      :remainingTime="remainingTime"
      :totalTime="testInfo.duration * 60"
    />

    <div
      class="test-content w-[90%] mx-auto bg-white rounded-[30px] flex flex-col items-center py-5 gap-3"
    >
      <audio
        v-if="tests.length && tests[0].audio"
        :src="tests[0].audio"
        controls
      ></audio>
      <h1 class="text-[24px] font-[600]">{{ testInfo?.partTitle }}</h1>
      <p class="w-[40%] text-center">
        {{ testInfo?.language }} - {{ testInfo?.level }}. Dinlediğiniz cümleleri
        tamamlayınız.
      </p>

      <div
        v-for="test in tests"
        :key="test.id"
        class="w-[70%] flex flex-col gap-5"
      >
        <h2 class="text-lg font-semibold">{{ test.title }}</h2>
        <div
          v-for="question in test.questions"
          :key="question.id"
          class="w-full flex flex-col gap-2"
        >
          <span class="font-medium">Soru {{ question.id }}:</span>
          <div
            v-for="option in question.options"
            :key="option.id"
            class="answer w-full py-5 flex items-center gap-3 bg-[#e8ebffcd] px-5 rounded-[15px] border border-[#b0bdef]"
          >
            <input
              type="radio"
              :name="'soru' + question.id"
              :id="'option' + option.id"
              :checked="selectedAnswers[question.id] === option.id"
              @change="selectAnswer(question.id, option.id)"
            />
            <label :for="'option' + option.id">{{ option.text }}</label>
          </div>
        </div>
      </div>

      <button
        @click="finishTest"
        class="px-6 py-2 cursor-pointer bg-red-600 rounded-[15px] text-white"
      >
        Testni Yakunlash
      </button>
    </div>
  </section>
</template>
