<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const recording = ref(false);
const audioUrl = ref(null);
const audioBlob = ref(null);
const mediaRecorder = ref(null);
const chunks = ref([]);
const speakingAnswers = ref([]);
const currentQuestionIndex = ref(0);
const startTime = ref(Number(sessionStorage.getItem("startTime")) || null);
const durationInSeconds = ref(null);
const timerInterval = ref(null);

const isTestStarted = ref(sessionStorage.getItem("isTestStarted") === "true");
const remainingTime = ref(0);
const selectedLevel = localStorage.getItem("selectedLevel") || "multilevel";
const selectedExamId = localStorage.getItem("selectedExamId");
// New loading state for loader display
const loading = ref(false);

// Fetch test data
const { data, error } = await useFetch(`${API_BASE_URL}/multilevel/test/`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  query: { language: 2, level: selectedLevel, test: "speaking", exam_id: selectedExamId },
});

if (error.value || !data.value?.part?.tests?.length) {
  alert("❌ Testler yüklenmedi..");
  router.push("/tests/multilevel/reading");
}

// Timer Functions
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

onMounted(() => {
  if (!isTestStarted.value) return redirectToMain();

  const wait = setInterval(() => {
    if (data.value) {
      clearInterval(wait);
      durationInSeconds.value = data.value.duration * 60;

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

// Audio Recording Logic
const startRecording = () => {
  if (recording.value) return;

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder.value = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorder.value.ondataavailable = (event) => {
      chunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = () => {
      audioBlob.value = new Blob(chunks.value, { type: 'audio/webm' });
      audioUrl.value = URL.createObjectURL(audioBlob.value);
    };

    mediaRecorder.value.start();
    recording.value = true;
  }).catch(error => {
    console.error("Microphone access denied", error);
    alert("❌ Lütfen mikrofonu açın.");
  });
};

const stopRecording = () => {
  if (mediaRecorder.value && recording.value) {
    mediaRecorder.value.stop();
    recording.value = false;
  }
};

// Save audio and score locally
const saveRecordingLocally = () => {
  if (!audioBlob.value || audioBlob.value.size === 0) {
    alert("❌ Ses boş olamaz.");
    return false;
  }

  speakingAnswers.value.push({
    question: currentQuestion.value.id,
    audioBlob: audioBlob.value,
    score: 0, // Placeholder for score, can be set once scoring is available
  });

  console.log("🎙 Kaydedilen ses:", speakingAnswers.value);

  return true;
};

const submitAllRecordings = async () => {
  const formData = new FormData();
  formData.append("test_result_id", data.value.test_result_id);

  speakingAnswers.value.forEach((answer, index) => {
    formData.append(`answers[${index}][question]`, answer.question);
    formData.append(`answers[${index}][speaking_audio]`, answer.audioBlob, `audio${index}.webm`);
  });

  console.log("🚀 Yuboriladigan FormData:", [...formData.entries()]);

  // Set loading state to true while submitting
  loading.value = true;

  try {
    const res = await fetch(`${API_BASE_URL}/multilevel/testcheck/speaking/`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      alert(`❌ Gönderirken hata oluştu: ${errText}`);
      console.error("❌ Server xatolik:", errText);
      return;
    }

    const result = await res.json();
    console.log("✅ Serverdan kelgan natija:", result);

    const saved = JSON.parse(localStorage.getItem("testResults") || "{}");

    saved.speaking = {
      score: result.score || null, // If score is not available, default to 50
      is_passed: result.is_passed,
    };

    localStorage.setItem("testResults", JSON.stringify(saved));

    // Clear session data to avoid data persistence across tests
    sessionStorage.removeItem("isTestStarted");
    sessionStorage.removeItem("startTime");
    sessionStorage.removeItem('currentQuestionIndex');
    sessionStorage.removeItem('isReading');
    localStorage.removeItem('isTestCompleted')

    // Redirect to results page after finishing the test
    router.push("/tests/multilevel/result");
  } catch (error) {
    alert("❌ YGönderirken hata oluştu: " + error.message);
    console.error("❌ Serverga yuborishda xatolik:", error);
  } finally {
    // Set loading to false after submission attempt
    loading.value = false;
  }
};


// Move to next question
const nextQuestion = async () => {
  const success = saveRecordingLocally();
  if (!success) return;

  audioBlob.value = null;
  audioUrl.value = null;
  chunks.value = [];

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  } else {
    finishTest();
  }
};

const finishTest = async () => {
  alert("✅ Sınav bitti!");

  await submitAllRecordings();

  speakingAnswers.value = [];

  console.log("🏁 Test yakunlandi, router push ishladi");
  router.push("/tests/multilevel/result");
};

// Questions Computation
const questions = computed(() => {
  const tests = data.value?.part?.tests || [];
  return tests.flatMap(test => test.questions.map(q => ({
    id: q.id,
    text: q.text,
    image: q.picture,
    test_result_id: data.value.test_result_id,
  })));
});

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
</script>

<template>
  <section class="w-full h-screen bg-[#DBEFFF] py-5 flex flex-col items-center gap-5">
    <SharedTestTime
      v-if="data"
      title="Speaking"
      :remainingTime="remainingTime"
      :totalTime="data.duration * 60"
    />

    <div v-if="currentQuestion" class="w-[90%] bg-white p-6 rounded-[30px] flex flex-col items-center gap-4">
      <h2 class="text-2xl font-semibold">{{ currentQuestion.text }}</h2>
      <img v-if="currentQuestion.image" :src="currentQuestion.image" class="w-full h-auto rounded-md" />

      <div class="flex items-center gap-4 mt-6">
        <button @click="startRecording" class="bg-red-500 p-4 rounded-full">🎤 Başlat</button>
        <button @click="stopRecording" class="bg-green-500 p-4 rounded-full">⏹ Durdur</button>
      </div>

      <div>
        <audio v-if="audioUrl" :src="audioUrl" controls></audio>
      </div>

      <button @click="nextQuestion" class="py-3 px-6 mt-6 bg-blue-600 text-white rounded-full">
        {{ currentQuestionIndex === questions.length - 1 ? "✅ Testin Sonu" : "➡️ Sonraki" }}
      </button>
    </div>

    <!-- Loader that appears when loading is true -->
    <div v-if="loading" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
      <div class="text-white text-xl">Gönderiliyor...</div>
    </div>
  </section>
</template>
