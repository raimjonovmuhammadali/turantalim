<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
import { ref, computed } from "vue";

const phone = ref("");
const password = ref("");
const showPassword = ref(false);

const isFormValid = computed(() => phone.value.trim() !== "" && password.value.trim() !== "");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <section class="w-[90%] lg:w-[40%] h-[511px] bg-white rounded-[30px] flex flex-col items-center gap-5 px-6 py-8">
    <h1 class="text-4xl font-semibold text-[#141522]">Giriş yap</h1>
    <h3 class="text-2xl font-normal text-[#141522]">Bilgilerinizi onaylayın</h3>
    <form class="w-full flex flex-col gap-5">
      <input
        v-model="phone"
        type="text"
        placeholder="Telefon numarası"
        class="w-full h-[70px] rounded-xl border-2 border-[#EDEFF7] outline-none px-5 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
      />
      
      <div class="relative w-full">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Şifre"
          class="w-full h-[70px] rounded-xl border-2 border-[#EDEFF7] outline-none px-5 pr-12 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
        />
        <button type="button" @click="togglePassword" class="absolute right-4 top-1/2 transform -translate-y-1/2">
            <SharedEyeClosed v-if="showPassword"/>
            <SharedEyeOpen v-else/>
        </button>
      </div>

      <button
        type="submit"
        :class="isFormValid ? 'bg-[#0C8CE9] cursor-pointer' : 'bg-[#85CCFF] cursor-not-allowed'"
        class="w-full h-[70px] rounded-xl text-white font-medium transition-opacity"
        :disabled="!isFormValid"
      >
        Giriş yap
      </button>
    </form>
    <nuxt-link to="./register" class="text-[#9199B1] text-lg underline">Hesabınız yok mu? Kayıt olun!</nuxt-link>
  </section>
</template>


