<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const isTestStarted = ref(sessionStorage.getItem("isTestStarted") === "true");
const startTime = ref(Number(sessionStorage.getItem("startTime")) || null);
const durationInSeconds = ref(null);
const remainingTime = ref(0);
const timerInterval = ref(null);
const selectedAnswers = ref(
  JSON.parse(sessionStorage.getItem("selectedAnswers")) || {}
);
const currentAudioIndex = ref(
  Number(localStorage.getItem("currentAudioIndex")) || 0
);

const nextTestOrder = ["reading", "writing", "speaking"];

const testLoading = ref(true);  // State to control the loader visibility

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

const tests = computed(
  () =>
    data.value?.part.tests.map((test) => ({
      id: test.id,
      title: test.title,
      desc: test.description,
      sample: test.sample,
      audio: test.audio,
      questions: test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        has_options: q.has_options,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
      })),
    })) || []
);

const allAudios = computed(() =>
  tests.value.map((test) => test.audio).filter(Boolean)
);
const audioElement = ref(null);

// 🎧 Audio ijro
const playAudio = (index) => {
  if (!allAudios.value[index]) {
    console.log("🎧 Barcha audiolar tugadi");
    return;
  }

  if (!audioElement.value) {
    audioElement.value = new Audio();
    audioElement.value.addEventListener("ended", () => {
      currentAudioIndex.value++;
      localStorage.setItem("currentAudioIndex", currentAudioIndex.value);
      playAudio(currentAudioIndex.value);
    });
  }

  audioElement.value.src = allAudios.value[index];
  audioElement.value.load();
  audioElement.value.play().catch((err) => {
    console.warn("Audio play error:", err);
  });
};

const resumeAudioFromLast = () => {
  if (allAudios.value.length > 0) {
    playAudio(currentAudioIndex.value);
  }
};

// ⏱ Timer
const updateRemainingTime = () => {
  if (!startTime.value || !durationInSeconds.value) return;
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
  remainingTime.value = durationInSeconds.value - elapsed;

  if (remainingTime.value <= 0) {
    clearInterval(timerInterval.value);
    finishTest();
  }
};

const startTimer = () => {
  updateRemainingTime();
  timerInterval.value = setInterval(updateRemainingTime, 1000);
};

// 👁 Tab kuzatish
const originalTitle = document.title;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (audioElement.value) audioElement.value.pause();
    document.title = "▶ Sahifaga qayting";
  } else {
    document.title = originalTitle;
    if (audioElement.value) {
      audioElement.value
        .play()
        .catch((err) => console.warn("Autoplay xatolik:", err));
    }
  }
});

// ✅ Javob tanlash
const selectAnswer = (questionId, value) => {
  selectedAnswers.value[questionId] = value;
  sessionStorage.setItem(
    "selectedAnswers",
    JSON.stringify(selectedAnswers.value)
  );
};

// ✅ Test yakunlash
const finishTest = async () => {
  const unmarkedQuestions = tests.value.flatMap((test) =>
    test.questions.filter((q) => !selectedAnswers.value[q.id])
  );

  if (unmarkedQuestions.length > 0) {
    if (
      !confirm(
        `Siz ${unmarkedQuestions.length} ta savolni belgilamadingiz. Yakunlaysizmi?`
      )
    )
      return;
  }

  if (remainingTime.value > 0 && !confirm("Testni yakunlaysizmi?")) return;

  clearInterval(timerInterval.value);

  const test_result_id = data.value?.test_result_id;
  if (!test_result_id) return alert("Test ID topilmadi.");

  const answers = Object.entries(selectedAnswers.value).map(([qId, optId]) => {
    const question = tests.value
      .flatMap((t) => t.questions)
      .find((q) => q.id === Number(qId));
    const option = question?.options.find((o) => o.id === Number(optId));
    return {
      question: Number(qId),
      user_option: Number(optId),
      user_answer: option?.text || String(optId),
    };
  });

  try {
    const res = await fetch(
      "https://turantalim2.pythonanywhere.com/multilevel/check-test/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ test_result_id, answers }),
      }
    );

    if (!res.ok) return alert("Xatolik: " + (await res.text()));

    const result = await res.json();
    const correct = result.answers.filter((a) => a.is_correct).length;
    const incorrect = result.answers.length - correct;

    const sectionTitle = "listening";
    const prevResults = JSON.parse(localStorage.getItem("testResults") || "{}");

    prevResults[sectionTitle] = {
      correct,
      incorrect,
      score: result.score,
      test_completed: result.test_completed,
    };
    localStorage.setItem("testResults", JSON.stringify(prevResults));

    sessionStorage.removeItem("startTime");
    sessionStorage.removeItem("selectedAnswers");

    alert(
      `✅ Test yakunlandi. To‘g‘ri: ${correct}, Xato: ${incorrect}, Ball: ${result.score}`
    );

    const nextSection =
      nextTestOrder[nextTestOrder.indexOf(sectionTitle) + 1] || "result";

    setTimeout(() => {
      router.push(`/tests/multilevel/${nextSection}`);
    }, 500);
  } catch (err) {
    console.error(err);
    alert("Testni yakunlashda xatolik yuz berdi.");
  }
};

// ✅ onMounted
onMounted(() => {
  resumeAudioFromLast()
  if (!isTestStarted.value) {
    router.push("/tests/multilevel/");
    return;
  }

  const wait = setInterval(() => {
    if (testInfo.value) {
      clearInterval(wait);
      durationInSeconds.value = testInfo.value.duration * 60;

      if (!startTime.value) {
        startTime.value = Date.now();
        sessionStorage.setItem("startTime", startTime.value);
      }

      startTimer();
      testLoading.value = false;  // Hide the loader when ready
    }
  }, 100);
});

// 🎧 Testlar kelganda audiolarni boshlash
watch(tests, async (val) => {
  if (val.length > 0) {
    await nextTick(); // DOM tayyor bo‘lganini kutamiz
    resumeAudioFromLast();
  }
});

onUnmounted(() => {
  clearInterval(timerInterval.value);
  if (audioElement.value) audioElement.value.pause();
});
</script>

<template>
  <section class="w-full bg-[#DBEFFF] py-5 flex flex-col gap-5">
    <SharedTestTime
      v-if="testInfo"
      title="Dinleme"
      :remainingTime="remainingTime"
      :totalTime="testInfo.duration * 60"
      class="sticky top-0 z-10"
    />

    <div
      class="test-content w-[90%] mx-auto bg-white rounded-[30px] flex flex-col items-center py-5 gap-3"
    >
      <h1 class="text-[24px] font-[600]">{{ testInfo?.partTitle }}</h1>
      <p class="w-[40%] text-center">
        {{ testInfo?.language }} - {{ testInfo?.level }}. Dinlediğiniz cümleleri
        tamamlayınız.
      </p>

      <!-- Loader added here -->
      <div
        v-if="testLoading"
        class="audio-container w-full h-[100px] flex items-center justify-center"
      >
        <span class="loader"></span>
      </div>

      <div
        v-for="(test, testIndex) in tests"
        :key="test.id"
        class="w-[70%] flex flex-col gap-5"
      >
        <h2 class="text-lg font-semibold">{{ test.title }}</h2>
        <p class="font-light">{{ test.desc }}</p>
        <p class="font-light">{{ test.sample }}</p>

        <div
          v-for="question in test.questions"
          :key="question.id"
          class="w-full flex flex-col gap-2"
        >
          <span class="font-medium">{{ question.text }}:</span>

          <!-- Agar variantlar mavjud bo‘lsa -->
          <template v-if="question.has_options">
            <div
              v-for="option in question.options"
              :key="option.id"
              class="w-full p-3 cursor-pointer bg-[#F5F5F5] rounded-md"
              @click="selectAnswer(question.id, option.id)"
              :class="{
                'bg-[#FFBB33]': selectedAnswers[question.id] === option.id,
              }"
            >
              <p>{{ option.text }}</p>
            </div>
          </template>

          <!-- Agar faqat matn inputi bo‘lsa -->
          <template v-else>
            <input
              type="text"
              class="w-full p-3 border rounded-md"
              v-model="selectedAnswers[question.id]"
            />
          </template>
        </div>
      </div>

      <div class="mt-5 w-[60%] flex justify-between items-center">
        <button @click="finishTest" class="w-full bg-[#4CAF50] py-2 text-white rounded-md">
          Testni yakunlash
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
