<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const isRecording = ref(false);
const volume = ref(0);
const audioUrl = ref("");
const error = ref("");
const voiceDetected = ref(false);
const showPlayback = ref(false);
const showModal = ref(false);
const currentQuestion = ref("");
const timeLeft = ref(10);
const postRecordCountdown = ref(15); // 🔄 Test boshlanish taymeri
let postCountdownInterval: any;

const questions = [
  "Kendinizi tanıtır mısınız?",
  "Bugün neler yaptınız?",
  "Boş zamanlarınızda ne yaparsınız?",
  "Seyahat etmeyi sever misiniz?",
  "Hayalinizdeki iş nedir?",
  "En sevdiğiniz yemek nedir?",
  "Aileniz hakkında biraz bahseder misiniz?",
  "Hafta sonu planlarınız nelerdir?",
  "En son izlediğiniz film neydi?",
  "Sabah rutinleriniz nasıldır?"
];

let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];
let analyser: AnalyserNode;
let dataArray: Uint8Array;
let animationId: number;
let stream: MediaStream;
let audioContext: AudioContext;
let countdownInterval: any;

function getRandomQuestion() {
  const idx = Math.floor(Math.random() * questions.length);
  currentQuestion.value = questions[idx];
}

async function initMic() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      cancelAnimationFrame(animationId);
      clearInterval(countdownInterval);

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioUrl.value = URL.createObjectURL(audioBlob);

      if (voiceDetected.value && audioBlob.size > 1000) {
        showPlayback.value = true;

        // 🔄 15 soniyali tayyorlanish taymeri
        postCountdownInterval = setInterval(() => {
          postRecordCountdown.value--;
          if (postRecordCountdown.value <= 0) {
            clearInterval(postCountdownInterval);
            router.push("./speaking");
          }
        }, 1000);
      } else {
        showModal.value = true;
      }

      audioChunks = [];
      voiceDetected.value = false;
      timeLeft.value = 10;
      postRecordCountdown.value = 15;
    };
  } catch (err) {
    error.value = "Mikrofona erişim reddedildi.";
  }
}

function monitorVolume() {
  analyser.getByteFrequencyData(dataArray);
  const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
  volume.value = avg;
  if (avg > 0.02) voiceDetected.value = true;
  animationId = requestAnimationFrame(monitorVolume);
}

function startTimedRecording() {
  if (!mediaRecorder) return;
  audioChunks = [];
  mediaRecorder.start();
  isRecording.value = true;
  monitorVolume();

  timeLeft.value = 10;
  countdownInterval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      stopRecording();
    }
  }, 1000);
}

function stopRecording() {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  isRecording.value = false;
}

function retryRecording() {
  showModal.value = false;
  getRandomQuestion();
  initMic();
}

function cancelTest() {
  router.push("/");
}

onMounted(() => {
  getRandomQuestion();
  initMic();
});
</script>

<template>
  <section class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F0FA] to-[#F4FAFF] text-center p-4 sm:p-8">
    <div class="w-full max-w-lg flex flex-col items-center">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-[#0C8CE9] mb-6 animate-fade-in">Konuşma Bölümü</h1>
      <h1 class="text-4xl md:text-xl font-extrabold text-[#00000064] mb-6 animate-fade-in">Mikrofonunuzun çalıştığından emin olun!</h1>


      <p class="text-base sm:text-lg mb-8 text-gray-700 w-full text-center">
        <strong class="text-[#0C8CE9]">Soru:</strong> {{ currentQuestion }}
      </p>

      <!-- Tugma va vaqt -->
      <div v-if="!showPlayback" class="mb-8 flex flex-col items-center">
        <div class="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center bg-[#0C8CE9] shadow-xl transform hover:scale-105 transition-transform duration-300">
          <div
            class="absolute w-full h-full rounded-full border-4 transition-all duration-100 ease-out"
            :style="{ transform: `scale(${1 + volume * 2.5})` }"
            :class="volume > 0.02 ? 'border-green-400 shadow-green-200' : 'border-gray-200 shadow-gray-100'"
          ></div>
          <button
            @click="startTimedRecording"
            :disabled="isRecording"
            class="z-10 text-white text-4xl sm:text-5xl focus:outline-none disabled:opacity-50 transition-opacity duration-200"
          >
            🎙️
          </button>
        </div>
        <p class="text-sm sm:text-base mt-4 text-gray-500 font-medium">
          Maksimum kayıt süresi: <strong class="text-[#0C8CE9]">{{ timeLeft }}</strong> saniye
        </p>
      </div>

      <!-- Eshitish -->
      <div v-if="audioUrl && showPlayback" class="mt-8 w-full flex flex-col items-center">
        <p class="text-gray-600 mb-3 font-medium">Kaydı dinleyin:</p>
        <audio
          :src="audioUrl"
          controls
          class="w-full max-w-md mx-auto rounded-lg shadow-md bg-white p-2"
        ></audio>

        <!-- 🔄 15 soniyalik taymer -->
        <div v-if="postRecordCountdown > 0" class="mt-4 text-sm text-gray-500">
          Testin başlaması için <span class="font-semibold text-[#0C8CE9]">{{ postRecordCountdown }}</span> saniye kaldı...
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-[90%] max-w-lg text-center transform transition-all duration-300 scale-100">
          <h2 class="text-xl sm:text-2xl font-bold text-red-600 mb-4 flex items-center justify-center gap-2">
            ⚠️ Ses algılanamadı
          </h2>
          <p class="text-gray-700 mb-6 text-sm sm:text-base">
            Konuşmadınız veya mikrofon çalışmıyor olabilir. Lütfen tekrar deneyin.
          </p>
          <div class="flex gap-4 justify-center">
            <button
              @click="retryRecording"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🔄 Tekrar Dene
            </button>
            <button
              @click="cancelTest"
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 sm:px-6 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              ❌ İptal Et
            </button>
          </div>
        </div>
      </div>

      <!-- Xatolik -->
      <p v-if="error" class="text-red-500 mt-6 text-sm sm:text-base font-medium animate-pulse">{{ error }}</p>
    </div>
  </section>
</template>
