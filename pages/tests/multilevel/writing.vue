<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const isTestStarted = ref(sessionStorage.getItem("isTestStarted") === "true");
const startTime = ref(Number(sessionStorage.getItem("startTime")) || null);
const timerInterval = ref(null);
const durationInSeconds = ref(null);
const remainingTime = ref(0);
const fileInputs = ref({});

// Fetch test data
const { data, error } = await useFetch("https://turantalim2.pythonanywhere.com/multilevel/test/", {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  query: { language: 2, level: "multilevel", test: "writing", exam_id: 1 },
});

// Redirect function
const redirectToMain = (message = "Xatolik yuz berdi.") => {
  alert(message);
  router.push("/tests/multilevel/");
};

// Check fetch result
if (error.value || !data.value?.part?.tests?.length) {
  redirectToMain("Test yuklanishda xatolik yoki testlar mavjud emas.");
}

// Computed properties
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
  data.value?.part.tests?.map((test) => ({
    ...test,
    questions: test.questions.map((q) => ({
      ...q,
      options: q.options || [],
    })),
  })) || []
);

// Timer functions
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

// Lifecycle
onMounted(() => {
  if (!isTestStarted.value) return redirectToMain();

  const wait = setInterval(() => {
    if (testInfo.value) {
      clearInterval(wait);
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

// File upload handler
const handleFileChange = (questionId, event) => {
  const file = event.target.files[0];
  if (file) {
    fileInputs.value[questionId] = file;
  }
};

// Finish test
const finishTest = async () => {
  if (!confirm("Testni yakunlaysizmi?")) return;
  clearInterval(timerInterval.value);
  
  const test_result_id = data.value?.test_result_id;
  localStorage.setItem('id', test_result_id);
  if (!test_result_id) return redirectToMain("Test ID topilmadi.");

  try {
    const formData = new FormData();

    for (const [questionId, file] of Object.entries(fileInputs.value)) {
      if (!file) continue;
      formData.append("writing_image", file);
      formData.append("test_result_id", test_result_id);
      formData.append("question", questionId);
    }

    const res = await fetch("https://turantalim2.pythonanywhere.com/multilevel/testcheck/writing/", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) return redirectToMain("Natija yuborishda xatolik: " + (await res.text()));

    const resultData = await res.json();

    // ✅ Save result to localStorage
    localStorage.setItem("writing_result", JSON.stringify(resultData));

    // Cleanup session
    sessionStorage.setItem("isTestStarted", "true");
    sessionStorage.removeItem("startTime");

    alert("✅ Test yakunlandi. Keyingi bo'limga o'tiladi.");

    // 🔥 Redirect to speaking test
    router.push("/tests/multilevel/speaking");

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
    <div class="test-content w-[90%] mx-auto bg-white rounded-[30px] flex flex-col items-center py-5 gap-3">
      <div v-for="test in tests" :key="test.id" class="w-[80%] flex flex-col gap-4">
        <h2 class="text-xl font-semibold">{{ test.title }}</h2>
        <p class="text-sm italic">{{ test.description }}</p>
        <p v-if="test.constraints" class="text-xs text-gray-500">{{ test.constraints }}</p>

        <div v-if="test.text_title" class="font-bold">{{ test.text_title }}</div>
        <div v-if="test.text" class="bg-gray-100 p-4 rounded-md whitespace-pre-line">{{ test.text }}</div>

        <div v-for="question in test.questions" :key="question.id" class="mt-4">
          <p class="font-medium">{{ question.text }}</p>

          <input
            type="file"
            accept="image/*"
            @change="(e) => handleFileChange(question.id, e)"
            class="mt-2"
          />
        </div>
      </div>

      <button
        @click="finishTest"
        class="mt-6 px-6 py-2 bg-red-600 rounded-[15px] text-white cursor-pointer hover:bg-red-700 transition"
      >
        Testni Yakunlash
      </button>
    </div>
  </section>
</template>
