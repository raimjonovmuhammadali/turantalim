<script setup lang="ts">
definePageMeta({
  middleware: 'auth', 
});
</script>

<template>
  <section
    class="w-full h-[100vh] flex flex-col items-center bg-[#DBEFFF] justify-start gap-5 py-5"
  >
    <nav
      class="w-[90%] mx-auto p-3 flex items-center justify-center bg-white rounded-2xl"
    >
      <img
        src="~/assets/images/logo.png"
        alt="logo"
        loading="lazy"
        width="50px"
      />
    </nav>

    <div
      class="test-about w-[90%] md:w-[40%] bg-white flex flex-col items-center gap-5 text-[#141522] rounded-[30px] py-5 px-4"
    >
      <div class="flex flex-col items-center">
        <h1 class="text-[24px] font-[600]">Hoş Geldiniz</h1>
        <p class="">Testlerden birini seçin:</p>
      </div>

      <div class="w-full test-types flex flex-col md:flex-row gap-5 md:gap-0 flex-wrap items-center justify-between">
        <div class="w-full md:w-[45%] flex items-center justify-center text-center">
          <nuxt-link to="/tests/listtest" class="w-full px-10 py-2 cursor-pointer bg-[#0C8CE9] rounded-[15px] text-white">Milliy sertifikat</nuxt-link>
        </div>
        <div class="w-full md:w-[45%] flex items-center justify-center text-center">
          <nuxt-link to="" class="w-full px-10 py-2 cursor-pointer bg-[#0C8CE9] rounded-[15px] text-white">TYS</nuxt-link>
        </div>
      </div>

      <nuxt-link to="/" class="text-gray-600">Ana sayfa~</nuxt-link>
    </div>
  </section>
</template>
