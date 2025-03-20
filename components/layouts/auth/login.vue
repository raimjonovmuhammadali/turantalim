<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/utils/api"; // 🟢 BASE_URL import qilindi

const router = useRouter();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

const isFormValid = computed(() => username.value.trim() !== "" && password.value.trim() !== "");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Javob tipi
interface LoginResponse {
  access: string;
  refresh: string;
  username: string;
}

const login = async () => {
  errorMessage.value = "";

  try {
    const response = await $fetch<LoginResponse>(`${API_BASE_URL}/user/login/`, { // 🟢 BASE_URL dan foydalanildi
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { username: username.value.trim(), password: password.value.trim() },
    });

    if (response.access && response.refresh) {
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      localStorage.setItem("username", username.value.trim());
      await router.push("/profile/");
    } else {
      errorMessage.value = "Login yoki parol noto‘g‘ri.";
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || "Serverga bog‘lanib bo‘lmadi.";
  }
};
const emit = defineEmits(["change-tab"]);
</script>
<template>
  <section class="w-full  h-[511px] bg-white rounded-[30px] flex flex-col items-center gap-5 px-6 py-8">
    <h1 class="text-4xl font-semibold text-[#141522]">Giriş yap</h1>
    <h3 class="text-2xl font-normal text-[#141522]">Bilgilerinizi onaylayın</h3>
    
    <form class="w-full flex flex-col gap-5" @submit.prevent="login">
      <input
        v-model="username"
        type="text"
        placeholder="Kullanıcı adı"
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

      <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

      <button
        type="submit"
        :class="isFormValid ? 'bg-[#0C8CE9] cursor-pointer' : 'bg-[#85CCFF] cursor-not-allowed'"
        class="w-full h-[70px] rounded-xl text-white font-medium transition-opacity"
        :disabled="!isFormValid"
      >
        Giriş yap
      </button>
    </form>

    <button @click="emit('change-tab', 'register')" class="text-[#9199B1] text-lg underline">Hesabınız yok mu? Kayıt olun!</button>
  </section>
</template>
