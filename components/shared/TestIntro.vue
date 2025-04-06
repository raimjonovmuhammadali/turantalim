<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();

const token = process.client ? localStorage.getItem("access_token") : null;
const testName = route.params.testName || "listening"; // URL: /tests/multilevel/:testName

const loading = ref(true);
const errorMessage = ref('');
const testInfo = ref(null);

// Data fetching
const { data, pending, error } = await useFetch(
  "https://turantalim2.pythonanywhere.com/multilevel/test/",
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: {
      language: 2,
      level: "multilevel",
      test: testName,
      exam_id: 1,
    },
  }
);

if (error.value) {
  errorMessage.value = 'Test ma\'lumotlarini yuklashda xatolik yuz berdi.';
  loading.value = false;
} else if (data.value) {
  testInfo.value = {
    testType: data.value.test_type,
    duration: data.value.duration,
    examTitle: data.value.part.exam.title,
    level: data.value.part.level,
    language: data.value.part.language.name,
    partTitle: data.value.part.title,
  };
  loading.value = false;
}

const testLabels = {
  listening: "Dinleme",
  writing: "Yazma",
  reading: "Okuma",
  speaking: "Konuşma",
};

const startTest = () => {
  sessionStorage.setItem("isTestStarted", "true");
  router.push(`/tests/multilevel/${testName}`);
};
</script>

<template>
  <section class="w-full h-[100vh] flex items-center justify-center bg-[#DBEFFF]">
    <div v-if="loading" class="w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
      <p class="text-center">Test yuklanmoqda...</p>
    </div>

    <div v-else-if="errorMessage" class="w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
      <p class="text-center text-red-600">{{ errorMessage }}</p>
    </div>

    <div v-else class="w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
      <div class="flex flex-col items-center">
        <h1 class="text-[24px] font-[600]">{{ testLabels[testName] || testName }}</h1>
        <p>Bu bölüme başlamak üzeresiniz.</p>
      </div>

      <div class="w-full test-types flex flex-wrap items-center justify-center">
        <div class="w-[23%] type flex flex-col items-center">
          <img src="~/assets/svg/headphone.svg" alt="headphone.svg" loading="lazy" />
          <span class="text-[12px]">{{ testLabels[testName] }}</span>
          <span class="font-[500]">{{ testInfo?.duration }} dakika</span>
        </div>
      </div>

      <div class="warn w-full flex flex-col gap-4 justify-center">
        <ul class="w-full flex flex-col gap-4 list-disc px-5">
          <li>Bu testteki sorular seviyenize uyum sağlamak için zorlaşabilir veya kolaylaşabilir.</li>
          <li>Her ses kaydını iki kez dinleyebilirsiniz (dinleme bölümü için geçerli).</li>
          <li>Bir egzersizi gönderdikten sonra geri dönemezsiniz.</li>
        </ul>
      </div>

      <button @click="startTest" class="px-10 py-2 cursor-pointer bg-[#0C8CE9] rounded-[15px] text-white">Başla</button>
    </div>
  </section>
</template>
