<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "#app";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const isLoading = ref(false);
const showFinishButton = ref(false);
const fileInputRef = ref(null);
const writingAnswers = ref([]);
const currentTestIndex = ref(0);
const currentQuestionIndex = ref(0);
const allQuestions = ref([]);
const startTime = ref(Date.now());
const remainingTime = ref(0);
const timerInterval = ref(null);
const durationInSeconds = ref(0);
const selectedLevel = localStorage.getItem("selectedLevel") || "multilevel";
const selectedExamId = localStorage.getItem("selectedExamId");
const { data, error } = await useFetch(
  `${API_BASE_URL}/multilevel/test/`,
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: { language: 2, level: selectedLevel, test: "writing", exam_id: selectedExamId },
  }
);

if (error.value || !data.value?.part?.tests?.length) {
  alert("Testler yüklenmedi.");
  router.push("/tests/multilevel/");
}

const tests = data.value.part.tests;
tests.forEach((test, testIdx) => {
  test.questions.forEach((q, qIdx) => {
    allQuestions.value.push({
      id: q.id,
      text: q.text,
      test_id: test.id,
      testIndex: testIdx,
      questionIndex: qIdx,
    });
  });
});

durationInSeconds.value = data.value.duration * 60;

const currentQuestion = computed(() => {
  return allQuestions.value.find(
    (q) =>
      q.testIndex === currentTestIndex.value &&
      q.questionIndex === currentQuestionIndex.value
  );
});

const getUploadedFile = (questionId) => {
  return writingAnswers.value.find((a) => a.question === questionId)
    ?.writing_image;
};

const uploadedFile = computed(() => {
  const file = getUploadedFile(currentQuestion.value?.id);
  return file instanceof File ? URL.createObjectURL(file) : null;
});

const updateRemainingTime = () => {
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
  remainingTime.value = durationInSeconds.value - elapsed;
  if (remainingTime.value <= 0) {
    clearInterval(timerInterval.value);
    finishTest(true);
  }
};

onMounted(() => {
  timerInterval.value = setInterval(updateRemainingTime, 1000);

  const saved = JSON.parse(localStorage.getItem("testResults") || "{}");
  const isDone = saved?.[data.value?.test_result_id]?.is_writing;

  if (isDone) {
    alert("Yazma sınavı tamamlandı.");
    router.push("/tests/multilevel/testMicrofon");
  }
});

onUnmounted(() => {
  clearInterval(timerInterval.value);
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file || !currentQuestion.value) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("Dosya boyutu 5MB'ı geçmemelidir.");
    return;
  }

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    alert("Sadece JPG ve PNG dosyaları kabul edilmektedir.");
    return;
  }

  const existing = writingAnswers.value.find(
    (a) => a.question === currentQuestion.value.id
  );
  if (existing) {
    existing.writing_image = file;
  } else {
    writingAnswers.value.push({
      question: currentQuestion.value.id,
      writing_image: file,
    });
  }

  fileInputRef.value.value = null;
};

const nextQuestion = () => {
  if (!getUploadedFile(currentQuestion.value.id)) {
    alert("❌ Lütfen bir resim yükleyin.");
    return;
  }

  const test = tests[currentTestIndex.value];
  const isLastQuestionInTest =
    currentQuestionIndex.value >= test.questions.length - 1;

  if (isLastQuestionInTest) {
    const isLastTest = currentTestIndex.value >= tests.length - 1;
    if (isLastTest) {
      showFinishButton.value = true;
      return;
    }
    currentTestIndex.value++;
    currentQuestionIndex.value = 0;
  } else {
    currentQuestionIndex.value++;
  }
};

const finishTest = async (auto = false) => {
  if (!auto && !confirm("Testi tamamlayacak mısın?")) return;

  const test_result_id = data.value?.test_result_id;
  if (!test_result_id) {
    alert("Test sonucu kimliği bulunamadı.");
    return;
  }

  try {
    isLoading.value = true;

    const formData = new FormData();
    formData.append("test_result_id", test_result_id);

    writingAnswers.value.forEach((answer, index) => {
      formData.append(`answers[${index}][question]`, answer.question);
      formData.append(
        `answers[${index}][writing_image]`,
        answer.writing_image
      );
    });

    const res = await fetch(
      `${API_BASE_URL}/multilevel/testcheck/writing/`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Bir hata oluştu.");
    }

    const result = await res.json();
    const { score, is_passed } = result;

    // LocalStorage ga test natijalarini saqlash
    const saved = JSON.parse(localStorage.getItem("testResults") || "{}");

    saved.writing = {
      score: score || 50, // If score is not available, default to 50
      is_writing: true,
    };

    localStorage.setItem("testResults", JSON.stringify(saved));

    alert("✅ Test tamamlandı.");
    router.push("/tests/multilevel/testMicrofon");
  } catch (e) {
    alert(e.message || "Kapatma sırasında hata oluştu.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="w-full py-6 px-4 flex flex-col items-center bg-[#f0f9ff] min-h-screen">
    <SharedTestTime
      v-if="data"
      title="Writing"
      :remainingTime="remainingTime"
      :totalTime="data.duration * 60"
      class="sticky top-0 z-10"
    />


    <div v-if="isLoading" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
      <div class="text-white text-xl">Gönderiliyor...</div>
    </div>

    <div
      v-else-if="currentQuestion"
      class="bg-white rounded-2xl shadow-xl p-6 max-w-xl w-full mt-6"
    >
      <h2 class="text-xl font-bold mb-2">{{ currentQuestion.text }}</h2>
      <p class="text-sm text-gray-500 mb-4">
        Test {{ currentTestIndex + 1 }} | Sorusu {{ currentQuestionIndex + 1 }}
      </p>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png"
        @change="handleFileChange"
        class="mb-4"
      />

      <div v-if="uploadedFile" class="mb-4">
        <p class="text-sm font-medium mb-1">📷 Yüklenen resim:</p>
        <img :src="uploadedFile" class="max-h-60 rounded border" />
      </div>

      <div class="flex justify-end gap-4">
        <button
          v-if="!showFinishButton"
          @click="nextQuestion"
          class="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700"
        >
          Sonraki
        </button>
        <button
          v-if="showFinishButton"
          @click="finishTest"
          class="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700"
        >
          ✅ Çözüm
        </button>
      </div>
    </div>
  </section>
</template>
