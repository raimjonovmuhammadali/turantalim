<template>
  <section
    class="w-full h-[100vh] flex flex-col items-center bg-[#DBEFFF] justify-start gap-5"
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
      <div class="flex flex-col items-center text-center">
        <h1 class="text-[24px] font-[600]">🎉 Tebrikler! 🎉</h1>
        <h1 class="text-[20px] font-[600]">Test sınavını tamamladınız!</h1>
        <p>Aşağıda becerilerinizle ilgili sonuçlarınızı görebilirsiniz:</p>
      </div>

      <p>Becerilerinizin Sonuçları:</p>
      <div
        class="w-full test-types flex flex-wrap items-center justify-between"
      >
        <div
          class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center"
        >
          <img src="~/assets/svg/bold.svg" alt="bold.svg" loading="lazy" />
          <span class="text-[12px]">Okuma</span>
          <span class="text-[12px] font-[500]">{{results?.reading?.score || 0}}</span>
        </div>
        <div
          class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center"
        >
          <img
            src="~/assets/svg/headphone.svg"
            alt="headphone.svg"
            loading="lazy"
          />
          <span class="text-[12px]">Dinlema</span>
          <span class="text-[12px] font-[500]">{{results?.listening?.score || 0}}</span>
        </div>
        <div
          class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center"
        >
          <img src="~/assets/svg/note.svg" alt="note.svg" loading="lazy" />
          <span class="text-[12px]">Yazma</span>
          <span class="text-[12px] font-[500]">{{results?.writing?.score || 0}}</span>
        </div>
        <div
          class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center"
        >
          <img src="~/assets/svg/sound.svg" alt="sound.svg" loading="lazy" />
          <span class="text-[12px]">Konusma</span>
          <span class="text-[12px] font-[500]">{{results?.speaking?.score || 0}}</span>
        </div>
      </div>

      <nuxt-link
        to="/tests"
        class="px-10 py-2 cursor-pointer bg-[#0C8CE9] rounded-[15px] text-white"
        >İleri</nuxt-link
      >
    </div>
  </section>
</template>

<script setup>
const results = ref(null);

onMounted(() => {
  const storedResults = localStorage.getItem("testResults");
  if (storedResults) {
    results.value = JSON.parse(storedResults);
  }
});
</script>
