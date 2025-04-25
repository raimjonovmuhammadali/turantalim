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
const selectedAnswers = ref(
  JSON.parse(sessionStorage.getItem("selectedAnswers")) || {}
);
const nextTestOrder = ["writing"];

const redirectToMain = (message = "Xatolik yuz berdi.") => {
  alert(message);
  router.push("/tests/multilevel/");
};

// Fetch test
const { data, error } = await useFetch(
  "https://turantalim2.pythonanywhere.com/multilevel/test/",
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: { language: 2, level: "multilevel", test: "reading", exam_id: 1 },
  }
);

// Agar xatolik bo‘lsa yoki testlar yo‘q bo‘lsa — chiqish
if (error.value || !data.value?.part?.tests?.length) {
  redirectToMain("Test yuklanishda xatolik yoki testlar mavjud emas.");
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

const tests = computed(
  () =>
    data.value?.part.tests?.map((test) => {
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
          hasOptions: true,
          options: allOptions,
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
  if (!isTestStarted.value) return redirectToMain();

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

// Javob tanlash
const selectAnswer = (questionId, value) => {
  selectedAnswers.value[questionId] = value;
  sessionStorage.setItem(
    "selectedAnswers",
    JSON.stringify(selectedAnswers.value)
  );
};

// Testni yakunlash
const finishTest = async () => {
  if (!confirm("Testni yakunlaysizmi?")) return;
  clearInterval(timerInterval.value);

  const test_result_id = data.value?.test_result_id;
  if (!test_result_id) return redirectToMain("Test ID topilmadi.");

  const answers = Object.entries(selectedAnswers.value).map(([qId, value]) => ({
    question: Number(qId),
    user_option: null,
    user_answer: String(value),
  }));

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

    if (!res.ok)
      return redirectToMain(
        "Natija jo‘natishda xatolik: " + (await res.text())
      );

    const result = await res.json();
    const correct = result.answers.filter((a) => a.is_correct).length;
    const incorrect = result.answers.length - correct;
    const score = ((correct / result.answers.length) * 100).toFixed(1);

    // Saqlash
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

    alert(`✅ Test yakunlandi.\nTo‘g‘ri: ${correct}, Xato: ${incorrect}, Ball: ${score}%`);

    const currentIndex = nextTestOrder.indexOf(sectionTitle);
    const nextSection = nextTestOrder[currentIndex + 1] || "result";

    router.push(`/tests/multilevel/${nextSection}`);
  } catch (err) {
    console.error(err);
    redirectToMain("Testni yakunlashda xatolik yuz berdi.");
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
    />

    <div
      class="test-content w-[90%] mx-auto bg-white rounded-[30px] flex flex-col items-center py-5 gap-3"
    >
      <div
        v-for="test in tests"
        :key="test.id"
        class="w-[80%] flex flex-col gap-4"
      >
        <h2 class="text-xl font-semibold">{{ test.title }}</h2>
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

          <div v-if="question.hasOptions && question.options.length">
            <select
              class="w-full p-2 border border-gray-300 rounded-md"
              :value="selectedAnswers[question.id] || ''"
              @change="(e) => selectAnswer(question.id, e.target.value)"
            >
              <option disabled value="">Variantni tanlang</option>
              <option
                v-for="option in question.options"
                :key="option.key"
                :value="option.key"
              >
                {{ option.key }}. {{ option.text }}
              </option>
            </select>
          </div>

          

          <div v-else class="mt-2">
            <textarea
              class="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              :value="selectedAnswers[question.id] || ''"
              @input="(e) => selectAnswer(question.id, e.target.value)"
              placeholder="Javobingizni kiriting..."
            />
          </div>
        </div>
      </div>

      <button
        @click="finishTest"
        class="mt-6 px-6 py-2 cursor-pointer bg-red-600 rounded-[15px] text-white"
      >
        Testni Yakunlash
      </button>
    </div>
  </section>
</template>
