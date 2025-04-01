<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const token = process.client ? localStorage.getItem("access_token") : null;

const { data, pending, error } = await useFetch(
  "https://turantalim2.pythonanywhere.com/multilevel/test/",
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query: {
      language: 2,
      level: "multilevel",
      test: "listening",
      exam_id: 1,
    },
  }
);

// Ma'lumotlarni ajratish
const testInfo = computed(() => {
  if (!data.value) return null;

  return {
    testType: data.value.test_type,
    duration: data.value.duration,
    examTitle: data.value.part.exam.title,
    level: data.value.part.level,
    language: data.value.part.language.name,
    partTitle: data.value.part.title,
  };
});



// Testni boshlash
const startTest = () => {
  sessionStorage.setItem("isTestStarted", "true"); // Test boshlangani belgilash
  router.push("./listening/start");
};
</script>

<template>
  <section class="w-full h-[100vh] flex items-center justify-center bg-[#DBEFFF]">
    <div class="test-about w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4">
      <div class="flex flex-col items-center">
        <h1 class="text-[24px] font-[600]">Dinleme</h1>
        <p class="">Dinleme bölümüne başlamak üzeresiniz.</p>
      </div>

      <div class="w-full test-types flex flex-wrap items-center justify-center">
        <div class="w-[23%] type flex flex-col items-center">
          <img src="~/assets/svg/headphone.svg" alt="headphone.svg" loading="lazy" />
          <span class="text-[12px]">Dinlema</span>
          <span class="font-[500]">{{testInfo.duration}} dakika</span>
        </div>
      </div>

      <div class="warn w-full flex flex-col gap-4 justify-center">
        <ul class="w-full flex flex-col gap-4 list-disc px-5">
          <li>Bu testteki sorular seviyenize uyum sağlamak için zorlaşabilir veya kolaylaşabilir. Tüm soruları cevaplayabilmeniz için ilerleme çubuğunu kullanarak kendinizi ayarlayın.</li>
          <li>Ses kaydını başlatmadan önce soruları okumak isteyebilirsiniz. Her ses kaydını iki kez dinleyebilirsiniz.</li>
          <li>Bir egzersizi gönderdikten sonra geri dönemezsiniz.</li>
        </ul>
      </div>

      <button @click="startTest" class="px-10 py-2 cursor-pointer bg-[#0C8CE9] rounded-[15px] text-white">Başla</button>
    </div>
  </section>
</template>
