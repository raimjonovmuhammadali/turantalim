<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const recording = ref(false);
const hasRecordedForCurrent = ref(false);
const audioUrl = ref(null);
const audioBlob = ref(null);
const mediaRecorder = ref(null);
const chunks = ref([]);
const speakingAnswers = ref([]);
const currentQuestionIndex = ref(0);
const startTime = ref(Number(sessionStorage.getItem("startTime")) || null);
const durationInSeconds = ref(null);
const timerInterval = ref(null);
const volume = ref(0);

let audioContext = null;
let analyser = null;
let dataArray = null;
let animationId = null;

const isTestStarted = ref(sessionStorage.getItem("isTestStarted") === "true");
const remainingTime = ref(0);
const selectedLevel = localStorage.getItem("selectedLevel") || "multilevel";
const selectedExamId = localStorage.getItem("selectedExamId");
const loading = ref(false);

const { data, error } = await useFetch(`${API_BASE_URL}/multilevel/test/`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  query: { language: 2, level: selectedLevel, test: "speaking", exam_id: selectedExamId },
});

if (error.value || !data.value?.part?.tests?.length) {
  alert("❌ Testlar yuklanmadi.");
  router.push("/tests/multilevel/reading");
}

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
  if (!isTestStarted.value) return router.push("/tests/multilevel");
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
  cancelAnimationFrame(animationId);
  if (audioContext) audioContext.close();
});

const startRecording = async () => {
  if (recording.value || hasRecordedForCurrent.value) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    const updateVolume = () => {
      if (!recording.value) return;
      analyser.getByteTimeDomainData(dataArray);
      const sum = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0);
      const avg = sum / dataArray.length;
      volume.value = Math.min(avg / 128, 1); // Normalize: 0 - 1
      animationId = requestAnimationFrame(updateVolume);
    };
    updateVolume();

    mediaRecorder.value = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunks.value = [];
    mediaRecorder.value.ondataavailable = (e) => chunks.value.push(e.data);
    mediaRecorder.value.onstop = () => {
      cancelAnimationFrame(animationId);
      stream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
      audioBlob.value = new Blob(chunks.value, { type: "audio/webm" });
      audioUrl.value = URL.createObjectURL(audioBlob.value);
      volume.value = 0;
    };

    mediaRecorder.value.start();
    recording.value = true;
  } catch (err) {
    alert("❌ Mikrofon ruxsatini bering.");
    console.error(err);
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && recording.value) {
    mediaRecorder.value.stop();
    recording.value = false;
    hasRecordedForCurrent.value = true;
  }
};

const saveRecordingLocally = () => {
  if (!audioBlob.value || audioBlob.value.size === 0) {
    alert("❌ Ovoz yozilmadi yoki bo‘sh.");
    return false;
  }
  speakingAnswers.value.push({
    question: currentQuestion.value.id,
    audioBlob: audioBlob.value,
    score: 0,
  });
  return true;
};

const submitAllRecordings = async () => {
  const formData = new FormData();
  formData.append("test_result_id", data.value.test_result_id);
  speakingAnswers.value.forEach((a, i) => {
    formData.append(`answers[${i}][question]`, a.question);
    formData.append(`answers[${i}][speaking_audio]`, a.audioBlob, `audio${i}.webm`);
  });

  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/multilevel/testcheck/speaking/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const result = await res.json();
    const saved = JSON.parse(localStorage.getItem("testResults") || "{}");
    saved.speaking = {
      score: result.score || null,
      is_passed: result.is_passed,
    };
    localStorage.setItem("testResults", JSON.stringify(saved));
    sessionStorage.clear();
    localStorage.removeItem("isTestCompleted");
    router.push("/tests/multilevel/result");
  } catch (err) {
    alert("❌ Yuborishda xatolik: " + err.message);
  } finally {
    loading.value = false;
  }
};

const nextQuestion = async () => {
  const success = saveRecordingLocally();
  if (!success) return;
  audioBlob.value = null;
  audioUrl.value = null;
  chunks.value = [];
  hasRecordedForCurrent.value = false;
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
  } else {
    finishTest();
  }
};

const finishTest = async () => {
  alert("✅ Test yakunlandi!");
  await submitAllRecordings();
  speakingAnswers.value = [];
};

const questions = computed(() => {
  const tests = data.value?.part?.tests || [];
  return tests.flatMap(t => t.questions.map(q => ({
    id: q.id,
    text: q.text,
    image: q.picture,
    test_result_id: data.value.test_result_id,
  })));
});

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
</script>

<template>
  <section class="w-full min-h-screen bg-gradient-to-br from-[#DBEFFF] to-[#E6F0FA] py-6 flex flex-col items-center gap-6">
    <SharedTestTime
      v-if="data"
      title="Speaking"
      :remainingTime="remainingTime"
      :totalTime="data.duration * 60"
      class="w-[90%]"
    />

    <div v-if="currentQuestion" class="w-[90%]  bg-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col items-center gap-5 animate-fade-in">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800 text-center">{{ currentQuestion.text }}</h2>
      <p class="md:text-md text-2xl font-bold text-gray-400 text-center">ℹ️ Düğmeye basın ve bırakmadan konuşun</p>
      <img v-if="currentQuestion.image" :src="currentQuestion.image" class="w-full h-auto rounded-lg max-w-md" />

      <!-- Mikrofon va ovoz to‘lqinlari -->
      <div
        class="relative mt-6 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center bg-[#0C8CE9] shadow-xl transform hover:scale-105 transition-transform duration-300"
        :class="{ 'opacity-50 cursor-not-allowed': hasRecordedForCurrent || loading }"
        @mousedown="!hasRecordedForCurrent && !loading && startRecording()"
        @mouseup="stopRecording"
        @mouseleave="recording && stopRecording()"
      >
        <!-- Ovoz to‘lqinlari faqat yozuv faol bo‘lganda ko‘rinadi -->
        <div
          v-if="recording"
          class="absolute w-full h-full rounded-full border-4 border-blue-300 opacity-60 animate-pulse-wave"
          :style="{ transform: `scale(${1 + volume * 0.5})` }"
        ></div>
        <div
          v-if="recording"
          class="absolute w-[120%] h-[120%] rounded-full border-4 border-blue-200 opacity-40 animate-pulse-wave-delayed"
          :style="{ transform: `scale(${1 + volume * 0.7})` }"
        ></div>
        <!-- Mikrofon ikonkasi -->
        <span class="text-white text-4xl sm:text-5xl z-10">🎙️</span>
      </div>

      <!-- Audio pleer -->
      <audio v-if="audioUrl" :src="audioUrl" controls class="mt-4 w-full max-w-md rounded-lg shadow-md bg-gray-50 p-2"></audio>

      <!-- Keyingi savol tugmasi -->
      <button
        @click="nextQuestion"
        class="py-3 px-6 sm:px-8 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200"
        :disabled="loading || !hasRecordedForCurrent"
      >
        {{ currentQuestionIndex === questions.length - 1 ? "✅ Testi tamamla" : "Sonraki soru" }}
      </button>
    </div>

    <!-- Yuklanmoqda holati -->
    <div v-if="loading" class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl shadow-lg text-center">
        <p class="text-gray-700">Yükleniyor...</p>
      </div>
    </div>
  </section>
</template>
  <!-- Tailwind Animatsiyalar -->
  <style scoped>
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
    @keyframes pulse-wave {
      0% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.3); opacity: 0.3; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .animate-pulse-wave {
      animation: pulse-wave 1.5s infinite ease-out;
    }
    .animate-pulse-wave-delayed {
      animation: pulse-wave 1.5s infinite ease-out 0.3s;
    }
  </style>