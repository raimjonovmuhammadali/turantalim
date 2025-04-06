<template>
    <section class="w-full h-[100vh] bg-[#DBEFFF] flex flex-col justify-center items-center gap-8">
      <div class="w-[80%] md:w-[50%] bg-white p-5 rounded-[20px] text-[#141522] flex flex-col items-center">
        <h1 class="text-3xl font-semibold mb-4">Test Yakunlandi</h1>
        <div class="result-info text-center mb-6">
          <h2 class="text-xl font-medium">To'g'ri: {{ correct }}</h2>
          <p>Javoblar soni: {{ totalQuestions }}</p>
          <p>Natija: {{ score }}%</p>
        </div>
        <button @click="goBack" class="px-6 py-2 bg-green-600 text-white rounded-[10px]">
          Boshqa testni tanlash
        </button>
      </div>
    </section>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const correct = 10; // to'g'ri javoblar soni
  const totalQuestions = 20; // umumiy savollar soni
  const score = (correct / totalQuestions) * 100; // foizda natija
  
  const goBack = () => {
    router.push("/tests/multilevel/");
  };
  </script>
  