<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const isTestStarted = ref(false);
const isTestFinished = ref(false);

const startTime = ref(Number(sessionStorage.getItem("startTime")) || null);
const durationInSeconds = ref(null);
const remainingTime = ref(0);
const timerInterval = ref(null);
const selectedAnswers = ref(
  JSON.parse(sessionStorage.getItem("selectedAnswers")) || {}
);
const nextTestOrder = ["writing"];

const redirectToMain = (message = "Bir hata oluştu.") => {
  alert(message);
  router.push("/tests/multilevel/writing");
};
const selectedLevel = localStorage.getItem("selectedLevel") || "multilevel";
const selectedExamId = localStorage.getItem("selectedExamId");
// Fetch test
const { data, error } = await useFetch(
  `${API_BASE_URL}/multilevel/test/`,
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: { language: 2, level: selectedLevel, test: "reading", exam_id: selectedExamId },
  }
);

// If error or no tests, redirect
if (error.value || !data.value?.part?.tests?.length) {
  redirectToMain("Test yükünde herhangi bir hata veya test bulunmamaktadır.");
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
        type: part.type,
      }
    : null;
});

const tests = computed(() =>
  data.value?.part.tests?.map((test) => {
    // Tashqi options (select dropdown uchun)
    const allOptions = test.options
      ? Object.entries(test.options).map(([key, value], index) => ({
          id: index + 1,
          key,
          text: value,
        }))
      : [];

    return {
      ...test,
      questions: test.questions.map((q) => ({
        ...q,
        // Agar question ichida options bo‘lsa, radio button; aks holda select dropdown
        isRadio: q.options && q.options.length > 0,
        options: q.options && q.options.length > 0 ? q.options : allOptions,
      })),
    };
  }) || []
);

// TIMER
const updateRemainingTime = () => {
  if (!startTime.value || !durationInSeconds.value) return;
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
  remainingTime.value = durationInSeconds.value - elapsed;

  if (remainingTime.value <= 0) {
    clearInterval(timerInterval.value);
    finishTest(); // Auto-finish
  }
};

const startTimer = () => {
  updateRemainingTime();
  timerInterval.value = setInterval(updateRemainingTime, 1000);
};

// INIT
onMounted(() => {
  localStorage.removeItem("audioCurrentTime");
  isTestStarted.value = true;
  sessionStorage.setItem("isTestStarted", "true");

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

onUnmounted(() => clearInterval(timerInterval.value));

// Answer selection
const selectAnswer = (questionId, optionId) => {
  selectedAnswers.value[questionId] = optionId;
  sessionStorage.setItem(
    "selectedAnswers",
    JSON.stringify(selectedAnswers.value)
  );
};

// Finish the test
const finishTest = async () => {
  if (!confirm("Testi tamamlayacak mısın?")) return;
  clearInterval(timerInterval.value);

  const test_result_id = data.value?.test_result_id;
  if (!test_result_id) return redirectToMain("Test Kimliği bulunamadı.");

  const answers = Object.entries(selectedAnswers.value).map(([qId, optId]) => {
    const question = tests.value.flatMap(t => t.questions).find(q => q.id === Number(qId));
    const option = question?.options.find(o => o.id === Number(optId));
    return {
      question: Number(qId),
      user_option: Number(optId),
      user_answer: option?.text || String(optId),
    };
  });

  const payload = {
    test_result_id: Number(test_result_id),
    answers,
  };


  try {
    const res = await fetch(
      `${API_BASE_URL}/multilevel/check-test/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ test_result_id, answers }),
      }
    );

    if (!res.ok)
      return redirectToMain(
        "Sonuç gönderilirken hata oluştu: " + (await res.text())
      );

    const result = await res.json();
    const total = result.answers.length;
    const correct = result.answers.filter((a) => a.is_correct).length;
    const incorrect = total - correct;
    const score = ((correct / total) * 100).toFixed(1);

    const sectionTitle = testInfo.value?.type || "unknown";
    const prevResults = JSON.parse(localStorage.getItem("testResults") || "{}");
    prevResults[sectionTitle] = {
      correct,
      incorrect,
      score: Number(score),
      test_completed: result.test_completed,
    };
    localStorage.setItem("testResults", JSON.stringify(prevResults));

    sessionStorage.setItem("isTestStarted", "true");
    sessionStorage.removeItem("startTime");
    sessionStorage.removeItem("selectedAnswers");

    alert(`✅ Test tamamlandı.`);

    const currentIndex = nextTestOrder.indexOf(sectionTitle);
    const nextSection = nextTestOrder[currentIndex + 1] || "result";
    router.push(`/tests/multilevel/${nextSection}`);
  } catch (err) {
    console.error(err);
    redirectToMain("Test tamamlanırken bir hata oluştu.");
  }
};
</script>

<template>
  <section class="w-full bg-[#DBEFFF] py-5 flex flex-col gap-5">
    <SharedTestTime
      v-if="testInfo"
      :title="testInfo.type"
      :remainingTime="remainingTime"
      :totalTime="testInfo.duration * 60"
      class="sticky top-0 z-10"
    />

    <div
      class="test-content w-[95%] mx-auto bg-white rounded-[30px] flex flex-col items-center py-5 gap-3"
    >
      <div
        v-for="test in tests"
        :key="test.id"
        class="w-[90%] flex flex-col gap-4"
      >
        <h2 class="text-xl font-semibold text-center">{{ test.title }}</h2>
        <p class="text-sm italic">{{ test.description }}</p>
        <p v-if="test.constraints" class="text-xs text-gray-500">
          {{ test.constraints }}
        </p>

        <div v-if="test.text_title" class="font-bold">
          {{ test.text_title }}
        </div>
        <div
          v-if="test.text"
          class="bg-gray-100 p-4 rounded-md whitespace-pre-line"
        >
          {{ test.text }}
        </div>

        <div v-for="question in test.questions" :key="question.id" class="mt-4">
          <p class="font-medium">{{ question.text }}</p>

          <!-- Radio buttonlar (question ichida options bo‘lsa) -->
          <div v-if="question.isRadio" class="mt-2">
            <label
              v-for="option in question.options"
              :key="option.id"
              class="flex items-center gap-2 mb-2"
            >
              <input
                type="radio"
                :name="'question-' + question.id"
                :value="option.id"
                :checked="selectedAnswers[question.id] === option.id"
                @change="selectAnswer(question.id, option.id)"
                class="form-radio"
              />
              <span>{{ option.text }}</span>
            </label>
          </div>

          <!-- Select dropdown (question ichida options bo‘lmasa) -->
          <div v-else-if="question.options.length" class="mt-2">
            <select
              class="w-full p-2 border border-gray-300 rounded-md"
              :value="selectedAnswers[question.id] || ''"
              @change="(e) => selectAnswer(question.id, Number(e.target.value))"
            >
              <option disabled value="">Cevaplardan birini seçin.</option>
              <option
                v-for="option in question.options"
                :key="option.id"
                :value="option.id"
              >
                {{ option.key }}. {{ option.text }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <button
        @click="finishTest"
        class="mt-6 px-6 py-2 cursor-pointer bg-red-600 rounded-[15px] text-white"
      >
        Test Tamamlama
      </button>
    </div>
  </section>
</template>