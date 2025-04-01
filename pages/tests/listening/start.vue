<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;
const isTestStarted = ref(sessionStorage.getItem("isTestStarted") === "true");
const remainingTime = ref(
  Number(sessionStorage.getItem("remainingTime")) || null
);
const timerInterval = ref(null);
const selectedAnswers = ref(
  JSON.parse(sessionStorage.getItem("selectedAnswers")) || {}
);

// ✅ API so‘rovini to‘g‘ri yuborish va xatolarni tekshirish
const { data, error } = await useFetch(
  "https://turantalim2.pythonanywhere.com/multilevel/test/",
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: { language: 2, level: "multilevel", test: "listening", exam_id: 1 },
  }
);

// ❌ Agar API xato qaytarsa, foydalanuvchini xabardor qilish
if (error.value) {
  console.error("❌ API xatosi:", error.value);
  alert("Test yuklanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
  router.push("/tests/multilevel/");
}

// 📝 Test ma’lumotlarini formatlash
const testInfo = computed(() =>
  data.value?.part
    ? {
        title: data.value.part.exam.title,
        duration: data.value.duration,
        level: data.value.part.level,
        language: data.value.part.language.name,
        partTitle: data.value.part.title,
      }
    : null
);

const tests = computed(
  () =>
    data.value?.part.tests?.map((test) => ({
      id: test.id,
      title: test.title,
      audio: test.audio,
      questions:
        test.questions?.map((q) => ({
          id: q.id,
          text: q.text,
          options:
            q.options?.map((opt) => ({ id: opt.id, text: opt.text })) || [],
        })) || [],
    })) || []
);

// ⏳ Taymerni boshlash
onMounted(() => {
  if (!isTestStarted.value) router.push("/tests/multilevel/");

  if (remainingTime.value) {
    // ⏳ Agar sessionStorage da vaqt bo‘lsa, uni ishlatamiz
    startTimer();
  } else {
    // 📥 Test ma'lumotlarini yuklanishini kutib, keyin vaqtni boshlaymiz
    const interval = setInterval(() => {
      if (testInfo.value) {
        remainingTime.value = testInfo.value.duration * 60;
        sessionStorage.setItem("remainingTime", remainingTime.value);
        startTimer();
        clearInterval(interval);
      }
    }, 500); // Har 0.5 sekundda tekshirib turadi
  }
  startTimer();
});

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
      sessionStorage.setItem("remainingTime", remainingTime.value);
    } else {
      clearInterval(timerInterval.value);
      alert("Test vaqti tugadi!");
      finishTest();
    }
  }, 1000);
};

// ✅ Javoblarni tanlash
const selectAnswer = (questionId, optionId) => {
  selectedAnswers.value[questionId] = optionId;
  sessionStorage.setItem(
    "selectedAnswers",
    JSON.stringify(selectedAnswers.value)
  );
};

// ✅ Testni yakunlash
const finishTest = async () => {
  if (!confirm("Testni yakunlaysizmi?")) return;
  clearInterval(timerInterval.value);

  const testResults = Object.entries(selectedAnswers.value).map(
    ([questionId, userOption]) => ({
      question: Number(questionId),
      user_option: Number(userOption),
      user_answer: String(userOption),
    })
  );
  console.log(testResults[0]);

  try {
    const response = await fetch(
      "https://turantalim2.pythonanywhere.com/multilevel/check-test/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(testResults),
      }
    );
    console.log(response);

    // ✅ JSON javobni tekshirish
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server xatosi:", text);
      alert(`Xatolik: ${text}`);
      return;
    }

    const result = await response.json();
    console.log("✅ Test natijalari yuborildi:", result);
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
    alert(
      "Testni yakunlashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring."
    );
  }
  
  sessionStorage.clear();
  router.push("/tests/multilevel/");
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
