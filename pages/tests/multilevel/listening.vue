<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "#app";
import { API_BASE_URL } from "@/utils/api";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const isTestStarted = ref(false);
const isListening = ref(false);
const isTestCompleted = ref(false);
const testStartedByUser = ref(false);
const testLoading = ref(true);
const errorMessage = ref(null);
const startTime = ref(null);
const durationInSeconds = ref(null);
const remainingTime = ref(0);
const timerInterval = ref(null);
const selectedAnswers = ref(JSON.parse(sessionStorage.getItem("selectedAnswers")) || {});
const currentAudioIndex = ref(Number(localStorage.getItem("currentAudioIndex")) || 0);
const audioElement = ref(null);

const { data, error } = await useFetch(`${API_BASE_URL}/multilevel/test/`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  query: { language: 2, level: "multilevel", test: "listening", exam_id: 1 },
});

if (error.value) {
  errorMessage.value = "Test yuklanishda xatolik yuz berdi.";
  testLoading.value = false;
} else {
  testLoading.value = false;
}

const testInfo = computed(() => {
  const part = data.value?.part;
  return part ? {
    title: part.exam.title,
    duration: data.value.duration,
    level: part.level,
    language: part.language.name,
    partTitle: part.title,
  } : null;
});

const tests = computed(() =>
  data.value?.part.tests.map(test => {
    const allOptions = test.options
      ? Object.entries(test.options).map(([key, value], index) => ({
          id: index + 1,
          key,
          text: value,
        }))
      : [];

    return {
      id: test.id,
      title: test.title,
      desc: test.description,
      sample: test.sample,
      audio: test.audio,
      questions: test.questions.map(q => ({
        id: q.id,
        text: q.text,
        isRadio: q.options && q.options.length > 0,
        options: q.options && q.options.length > 0 ? q.options : allOptions,
      })),
    };
  }) || []
);

const allAudios = computed(() => tests.value.map(test => test.audio).filter(Boolean));

const unmarkedQuestions = computed(() =>
  tests.value.flatMap(test => test.questions.filter(q => !selectedAnswers.value[q.id]))
);

const playAudio = (index) => {
  if (!allAudios.value[index]) return;

  if (!audioElement.value) {
    audioElement.value = new Audio();
    audioElement.value.addEventListener("ended", () => {
      currentAudioIndex.value++;
      localStorage.setItem("currentAudioIndex", currentAudioIndex.value);
      playAudio(currentAudioIndex.value);
    });
    audioElement.value.addEventListener("timeupdate", () => {
      localStorage.setItem("audioCurrentTime", audioElement.value.currentTime);
    });
  }

  audioElement.value.src = allAudios.value[index];
  const savedTime = Number(localStorage.getItem("audioCurrentTime")) || 0;
  audioElement.value.currentTime = savedTime;

  setTimeout(() => {
    audioElement.value.play().catch(err => {
      console.warn("Audio autoplay blocked:", err.message);
    });
  }, 500);
};

const startTimer = () => {
  updateRemainingTime();
  timerInterval.value = setInterval(updateRemainingTime, 1000);
};

const updateRemainingTime = () => {
  if (!startTime.value || !durationInSeconds.value) return;
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
  remainingTime.value = durationInSeconds.value - elapsed;
  if (remainingTime.value <= 0) {
    clearInterval(timerInterval.value);
    finishTest(true);
  }
};

const selectAnswer = (questionId, optionId) => {
  selectedAnswers.value[questionId] = optionId;
  sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers.value));
};

const startTest = () => {
  testStartedByUser.value = true;
  isTestStarted.value = true;
  isListening.value = true;
  startTime.value = Date.now();
  sessionStorage.setItem("startTime", startTime.value);
  durationInSeconds.value = testInfo.value.duration * 60;
  startTimer();
  playAudio(currentAudioIndex.value);
  sessionStorage.setItem("isTestStarted", "true");
};

const finishTest = async (isAutoFinish = false) => {
  if (!isAutoFinish && unmarkedQuestions.value.length > 0 &&
      !confirm(`Siz ${unmarkedQuestions.value.length} ta savolga javob bermadingiz. Baribir yakunlaysizmi?`)) return;

  clearInterval(timerInterval.value);
  const test_result_id = data.value?.test_result_id;
  if (!test_result_id) return alert("Test ID topilmadi.");

  const answers = Object.entries(selectedAnswers.value).map(([qId, optId]) => {
    const question = tests.value.flatMap(t => t.questions).find(q => q.id === Number(qId));
    const option = question?.options.find(o => o.id === Number(optId));
    return {
      question: Number(qId),
      user_option: Number(optId),
      user_answer: option?.text || String(optId),
    };
  });

  try {
    const res = await fetch(`${API_BASE_URL}/multilevel/check-test/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ test_result_id, answers }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Server xatoligi");
    }

    const result = await res.json();
    const correct = result.answers.filter(a => a.is_correct).length;
    const total = result.answers.length;
    const percentage = Math.round((correct / total) * 100);
    isListening.value = false;
    isTestCompleted.value = true;
    localStorage.setItem("isTestCompleted", true);

    const prevResults = JSON.parse(localStorage.getItem("testResults") || "{}");
    prevResults.listening = { correct, incorrect: total - correct, score: result.score, percentage };
    localStorage.setItem("testResults", JSON.stringify(prevResults));

    // Tozalash
    sessionStorage.removeItem("startTime");
    sessionStorage.removeItem("selectedAnswers");
    sessionStorage.removeItem("isTestStarted");
    localStorage.removeItem("audioCurrentTime");
    localStorage.removeItem("currentAudioIndex");

    alert("✅ Test yakunlandi.");
    router.push("/tests/multilevel/reading");
  } catch (err) {
    console.error(err);
    alert(`Xatolik: ${err.message}`);
  }
};

onMounted(() => {
  const started = sessionStorage.getItem("isTestStarted") === "true";
  const completed = localStorage.getItem("isTestCompleted");

  if (completed && !isListening.value) {
    router.push("/tests/multilevel/reading");
    return;
  }

  if (started) {
    isTestStarted.value = true;
    testStartedByUser.value = true;
    isListening.value = true;

    const storedStartTime = sessionStorage.getItem("startTime");
    const duration = testInfo.value?.duration;

    if (storedStartTime && duration) {
      startTime.value = Number(storedStartTime);
      durationInSeconds.value = duration * 60;
      updateRemainingTime();
      startTimer();
    }

    if (!audioElement.value) {
      audioElement.value = new Audio();
      audioElement.value.addEventListener("ended", () => {
        currentAudioIndex.value++;
        localStorage.setItem("currentAudioIndex", currentAudioIndex.value);
        playAudio(currentAudioIndex.value);
      });
      audioElement.value.addEventListener("timeupdate", () => {
        localStorage.setItem("audioCurrentTime", audioElement.value.currentTime);
      });
    }

    playAudio(currentAudioIndex.value);
  }
});

onUnmounted(() => {
  clearInterval(timerInterval.value);
  audioElement.value?.pause();
});
</script>



<template>
  <section class="w-full bg-[#DBEFFF] py-5 flex flex-col gap-5">
    <!-- Start Page -->
    <section v-if="!testStartedByUser" class="w-full h-[100vh] flex items-center justify-center">
      <div v-if="testLoading" class="w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
        <p>Yükleme testi...</p>
      </div>
      <div v-else-if="errorMessage" class="w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
        <p class="text-red-600">{{ errorMessage }}</p>
      </div>
      <div v-else class="w-[95%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
        <h1 class="text-[24px] font-[600]">Dinleme</h1>
        <p>Dinleme bölümüne başlamak üzeresiniz.</p>
        <div class="w-full flex justify-center">
          <div class="w-[23%] flex flex-col items-center">
            <img src="~/assets/svg/headphone.svg" alt="headphone" loading="lazy" />
            <span class="font-[500]">{{ testInfo?.duration }} dakika</span>
          </div>
        </div>
        <ul class="w-full flex flex-col gap-4 list-disc px-5">
          <li>Bu testteki sorular seviyenize uyum sağlamak için zorlaşabilir veya kolaylaşabilir.</li>
          <li>Ses kaydını başlatmadan önce soruları okuyun. Her ses kaydını iki kez dinleyebilirsiniz.</li>
          <li>Bir egzersizi gönderdikten sonra geri dönemezsiniz.</li>
        </ul>
        <button @click="startTest" class="px-10 py-2 bg-[#0C8CE9] rounded-[15px] text-white">Başla</button>
      </div>
    </section>

    <!-- Test Content -->
    <template v-else>
      <SharedTestTime v-if="testInfo" title="Dinleme" :remainingTime="remainingTime" :totalTime="testInfo.duration * 60" class="sticky top-0 z-10" />
      <div class="test-content w-[90%] mx-auto bg-white rounded-[30px] flex flex-col items-center py-5 gap-3">
        <h1 class="text-[20px] font-[600] text-center">{{ testInfo?.partTitle }}</h1>
        <p class="w-[90%] text-center">{{ testInfo?.language }} - {{ testInfo?.level }}. Dinlediğiniz cümleleri tamamlayınız.</p>
        <div v-for="test in tests" :key="test.id" class="w-[90%] flex flex-col gap-5">
          <h2 class="text-lg font-semibold">{{ test.title }}</h2>
          <p class="font-light">{{ test.desc }}</p>
          <p class="font-light">{{ test.sample }}</p>
          <div v-for="question in test.questions" :key="question.id" class="w-full flex flex-col gap-2">
            <span class="font-medium" :class="{ 'text-red-600': !selectedAnswers[question.id] }">{{ question.text }}:</span>
            <!-- Radio buttonlar (question ichida options bo‘lsa) -->
            <div v-if="question.isRadio" class="flex flex-col gap-2">
              <label v-for="option in question.options" :key="option.id" class="flex items-center gap-2 cursor-pointer">
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
            <!-- Select dropdown (question ichida options bo‘lmasa, lekin tashqarida options bo‘lsa) -->
            <div v-else-if="question.options.length" class="mt-2">
              <select
                class="w-full p-3 border rounded-md"
                :class="{ 'border-red-600': !selectedAnswers[question.id] }"
                :value="selectedAnswers[question.id] || ''"
                @change="(e) => selectAnswer(question.id, Number(e.target.value))"
              >
                <option disabled value="">Cevaplardan birini seçin.</option>
                <option v-for="option in question.options" :key="option.id" :value="option.id">
                  {{ option.text }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <button @click="finishTest" class="w-[60%] bg-[#4CAF50] py-2 text-white rounded-md mt-5">Testi tamamla</button>
      </div>
    </template>
  </section>
</template>