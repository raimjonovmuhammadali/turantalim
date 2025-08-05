<script setup lang="ts">
import TestBox from "~/components/shared/TestBox.vue";
import { useBox } from "~/types";

const { boxes } = useBox();
const is_auth = localStorage.getItem("access_token");


</script>
<template>
  <header
    class="w-full h-auto md:h-[100vh] bg-[#DBEFFF] py-5 flex flex-col justify-between"
  >
    <nav
      class="w-[90%] mx-auto h-[10vh] p-4 flex items-center justify-between bg-white rounded-[30px] shadow-md"
    >
      <img
        src="~/assets/images/logo.png"
        alt="Logo"
        class="h-10"
        loading="lazy"
      />
      <ul class="hidden md:flex items-center gap-5 font-[500] text-[20px]">
        <li>
          <nuxt-link to="/">Ana sayfa</nuxt-link>
        </li>
        <li><a href="#tests">Testler</a></li>
      </ul>
      <nuxt-link
        to="/auth"
        v-if="!is_auth"
        class="px-5 py-3 rounded-xl text-white font-medium bg-[#0C8CE9] cursor-pointer"
      >
        Üye olun
      </nuxt-link>
      <nuxt-link
        to="/profile"
        v-if="is_auth"
        class="px-5 py-3 rounded-xl text-white font-medium bg-[#0C8CE9] cursor-pointer"
      >
        Profilim
      </nuxt-link>
    </nav>

    <div
      class="w-[90%] mx-auto flex flex-col md:flex-row items-center justify-between py-5 md:py-0"
    >
      <div class="w-full md:w-6/12 text-center md:text-start">
        <h1 class="text-[40px] md:text-[64px] text-[#141522] font-[600] mb-5">
          "Turan Talim" ile Türkçeyi baştan sona öğrenin!
        </h1>
        <nuxt-link
          to="/auth"
          v-if="!is_auth"
          class="mt-5 px-5 py-3 rounded-xl text-white font-medium bg-[#0C8CE9] cursor-pointer"
        >
          Üye olun
        </nuxt-link>
        <nuxt-link
          to="/profile"
          v-if="is_auth"
          class="mt-5 px-5 py-3 rounded-xl text-white font-medium bg-[#0C8CE9] cursor-pointer"
        >
          Profilim
        </nuxt-link>
      </div>
      <div class="w-full md:w-6/12 hidden md:flex items-center justify-end">
        <img src="~/assets/images/banner.png" alt="banner img" loading="lazy" />
      </div>
    </div>
  </header>
  <main class="w-full" id="tests">
    <div
      class="test-section w-[90%] mx-auto h-auto md:h-[600px] flex flex-col gap-10 justify-center"
    >
      <h1 class="text-[30px] md:text-[50px] font-[600]">
        Genel test sınavları
      </h1>
      <div class="tests-boxes flex gap-5 flex-wrap">
        <TestBox v-for="box in boxes" :key="box.id" :box="box" />
      </div>
    </div>

    <!-- <div
      class="about w-full h-auto md:h-[600px] bg-[#DBEFFF] flex flex-col-reverse md:flex-row items-center py-5 md:py-0" id="about"
    >
      <div
        class="about-auto w-[90%] mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between"
      >
        <div class="about-content w-full md:w-6/12 text-center md:text-start">
          <h1 class="text-[60px] font-[600]">Biz haqimizda</h1>
          <p>
            Turan Ta'lim – Bilim Va Taraqqiyot Maskani Turan Ta'lim – sifatli va
            innovatsion ta’limni ta’minlovchi zamonaviy platforma. Biz har bir
            inson uchun bilim olish imkoniyatlarini kengaytirishga intilamiz.
            Tajribali ustozlar, interaktiv darslar va samarali o‘qitish tizimi
            orqali o‘quvchilarga qulay va samarali ta’lim muhitini yaratamiz.
            Turan Ta'lim – kelajagingiz sari ishonchli qadam!
          </p>
        </div>
        <div class="about-img w-full md:w-6/12">
          <img src="~/assets/images/logo-about.png" alt="" />
        </div>
      </div>
    </div> -->

    <div
      class="register-form w-full flex items-center justify-center h-auto md:h-[500px] p-5 md:p-0"
    >
      <form action="" class="w-full md:w-[30%] text-center flex flex-col gap-4">
        <h1 class="text-[30px] font-[600]">Kursa kaydolun</h1>
        <input
          type="text"
          placeholder="Adınız"
          class="border border-[#e3e9ff] px-4 py-3 bg-[#EDEFF7] outline-none rounded-[15px]"
        />
        <input
          type="text"
          placeholder="Soyadınız"
          class="border border-[#e3e9ff] px-4 py-3 bg-[#EDEFF7] outline-none rounded-[15px]"
        />
        <input
          type="text"
          placeholder="+998"
          class="border border-[#e3e9ff] px-4 py-3 bg-[#EDEFF7] outline-none rounded-[15px]"
        />
        <button
          type="submit"
          class="w-full rounded-xl p-3 text-white font-medium transition-opacity flex items-center justify-center bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Kayıt yap
        </button>
      </form>
    </div>
  </main>

  <footer class="w-full h-auto md:h-[300px] bg-[#01042A] py-5 md:py-0">
    <div
      class="w-[90%] h-full mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-start"
    >
      <div
        class="w-full copyright text-white text-[18px] flex flex-col gap-4 items-center md:items-start"
      >
        <img
          src="~/assets/images/logo.png"
          alt="logo"
          loading="lazy"
          width="80px"
        />
        <h1>Turantalim</h1>
        <p>Barcha huquqlar himoyalangan.</p>
      </div>

      <div class="w-full contact text-white flex flex-col items-center gap-4">
        <h1 class="text-[18px]">Yöneticiyle iletişime geçin</h1>
        <a href="">+998 90 846 81 88</a>
        <ul class="flex gap-5">
          <!-- <li>
            <a href="#"
              ><img
                src="~/assets/svg/facebook.svg"
                alt="facebook"
                loading="lazy"
            /></a>
          </li>
          <li>
            <a href="#"
              ><img
                src="~/assets/svg/instagram.svg"
                alt="instagram"
                loading="lazy"
            /></a>
          </li> -->
          <li>
            <a href="https://t.me/turkiyedeokumak"
              ><img
                src="~/assets/svg/telegram.svg"
                alt="twitter"
                loading="lazy"
            /></a>
          </li>
        </ul>
      </div>

      <div
        class="w-full adress text-[18px] text-white flex flex-col items-center md:items-end gap-4 text-center md:text-start"
      >
        <span class="text-[14px]">Adres</span>
        <p>
          Farg’ona shahar, A. <br />
          Navoiy 80B
        </p>
        <span class="text-[14px]">Çalışma saatleri:</span>
        <p>
          Pazartesi - Cuma <br />
          9:00 — 18:00
        </p>
      </div>
    </div>
  </footer>
</template>
<style scoped>
*{
  scroll-behavior: smooth;
}
</style>