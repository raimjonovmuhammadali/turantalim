<script setup lang="ts">
definePageMeta({
  middleware: 'auth', 
});
</script>

<template>
  <section
    class="w-full h-auto md:h-[100vh] flex flex-col items-center bg-[#DBEFFF] justify-evenly gap-5"
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
        <p class="">Testi başlatmak üzeresiniz.</p>
      </div>

      <div class="w-full test-types flex flex-wrap items-center justify-between">
        <div class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center">
          <img src="~/assets/svg/bold.svg" alt="bold.svg" loading="lazy" />
          <span class="text-[12px]">Okuma</span>
          <span class="text-[12px] font-[500]">20 dakika</span>
        </div>
        <div class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center">
          <img src="~/assets/svg/headphone.svg" alt="headphone.svg" loading="lazy" />
          <span class="text-[12px]">Dinlema</span>
          <span class="text-[12px] font-[500]">20 dakika</span>
        </div>
        <div class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center">
          <img src="~/assets/svg/note.svg" alt="note.svg" loading="lazy" />
          <span class="text-[12px]">Yazma</span>
          <span class="text-[12px] font-[500]">20 dakika</span>
        </div>
        <div class="w-[10%] md:w-[23%] type flex flex-col items-center justify-center text-center">
          <img src="~/assets/svg/sound.svg" alt="sound.svg" loading="lazy" />
          <span class="text-[12px]">Konusma</span>
          <span class="text-[12px] font-[500]">20 dakika</span>
        </div>
      </div>

      <div class="warn w-full flex flex-col gap-4 justify-center">
          <h1>✅ Dikkat Edin:</h1>
        <ul class="w-full flex flex-col gap-4 list-disc px-5">
            <li>
                Teste başlamadan önce, tamamlamak için yeterli zamanınız olduğundan emin olun. Teste başladıktan sonra zamanlayıcıyı durduramaz veya testi yeniden başlatamazsınız. Gerekirse test bölümleri arasında çok kısa molalar verebilirsiniz. Bu molalar da süreye tabidir.
            </li>
            <li>
                Testi yalnızca bir kez alabilirsiniz. Pratik yapmak için tekrar edemezsiniz.
            </li>
            <li>
                İnternet bağlantınız istikrarlı değilse, testi tamamlayamayabilirsiniz. Kısmen tamamlanan testler kaydedilmez.
            </li>
            <li>
                Yanlış cevaplar için puan kaybetmezsiniz.
            </li>
            <li>Bir egzersizi gönderdikten sonra geri dönemezsiniz.</li>
        </ul>
      </div>

      <nuxt-link to="/tests/multilevel/listening" class="px-10 py-2 cursor-pointer bg-[#0C8CE9] rounded-[15px] text-white">İleri</nuxt-link>
      <nuxt-link to="/">Ana sayfa~</nuxt-link>
    </div>
  </section>
</template>
