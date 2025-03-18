<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  username: '',
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const isFormValid = computed(() =>
  form.value.username.trim() !== "" &&
  form.value.password.trim() !== "" &&
  form.value.confirmPassword.trim() !== "" &&
  form.value.password === form.value.confirmPassword
);

const isPasswordMismatch = computed(() =>
  form.value.confirmPassword !== "" && form.value.password !== form.value.confirmPassword
);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const registerUser = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.post("https://turantalim2.pythonanywhere.com/user/register/", {
      username: form.value.username,
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      phone: form.value.phone || null,
      email: form.value.email || null,
      password: form.value.password,
      confirm_password: form.value.confirmPassword,
    });

    console.log("User registered:", response.data);

    // Muvaffaqiyatli ro‘yxatdan o‘tganidan keyin login sahifasiga yo‘naltirish
    router.push("./login");
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi!";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="w-[90%] lg:w-[40%] bg-white rounded-[30px] flex flex-col items-center gap-5 px-6 py-8">
    <h1 class="text-3xl font-semibold text-[#141522]">Kayıt ol</h1>
    <h3 class="text-xl font-normal text-[#141522]">Bilgilerinizi onaylayın</h3>

    <form @submit.prevent="registerUser" class="w-full flex flex-col gap-4">
      <input v-model="form.username" type="text" placeholder="Username"
        class="w-full rounded-xl border-2 border-gray-300 outline-none p-3 bg-gray-100 text-gray-500 focus:border-blue-500 focus:text-black transition" />

      <input v-model="form.firstName" type="text" placeholder="Ad"
        class="w-full rounded-xl border-2 border-gray-300 outline-none p-3 bg-gray-100 text-gray-500 focus:border-blue-500 focus:text-black transition" />

      <input v-model="form.lastName" type="text" placeholder="Soyad"
        class="w-full rounded-xl border-2 border-gray-300 outline-none p-3 bg-gray-100 text-gray-500 focus:border-blue-500 focus:text-black transition" />

      <input v-model="form.phone" type="text" placeholder="Telefon numarası (Opsiyonel)"
        class="w-full rounded-xl border-2 border-gray-300 outline-none p-3 bg-gray-100 text-gray-500 focus:border-blue-500 focus:text-black transition" />

      <input v-model="form.email" type="email" placeholder="E-posta adresi (Opsiyonel)"
        class="w-full rounded-xl border-2 border-gray-300 outline-none p-3 bg-gray-100 text-gray-500 focus:border-blue-500 focus:text-black transition" />

      <div class="relative w-full">
        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Yeni şifre"
          class="w-full rounded-xl border-2 border-gray-300 outline-none p-3 pr-12 bg-gray-100 text-gray-500 focus:border-blue-500 focus:text-black transition" />

        <button type="button" @click="togglePassword" class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
          <SharedEyeClosed v-if="showPassword" />
          <SharedEyeOpen v-else />
        </button>
      </div>

      <input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="Şifreyi onaylayın"
        class="w-full rounded-xl border-2 outline-none p-3 pr-12 bg-gray-100 text-gray-500 focus:text-black transition"
        :class="isPasswordMismatch ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'" />

      <!-- Xatolik xabari -->
      <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

      <button type="submit"
        class="w-full rounded-xl p-3 text-white font-medium transition-opacity flex items-center justify-center"
        :class="isFormValid ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-blue-300 cursor-not-allowed'"
        :disabled="!isFormValid || isLoading">
        <span v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span v-else>Kayıt ol</span>
      </button>
    </form>

    <nuxt-link to="./login" class="text-gray-500 text-sm underline"> Zaten bir hesabınız var mı? Giriş yap! </nuxt-link>
  </section>
</template>
