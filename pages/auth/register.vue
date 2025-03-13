<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

import { ref, computed } from "vue";

const form = ref({
  firstName: "",
  lastName: "",
  address: "",
  phoneOrEmail: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);

const isFormValid = computed(() =>
  Object.values(form.value).every((val) => val.trim() !== "") &&
  form.value.password === form.value.confirmPassword
);

const isPasswordMismatch = computed(() =>
  form.value.confirmPassword !== "" && form.value.password !== form.value.confirmPassword
);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const registerUser = () => {
  if (!isFormValid.value) return;
  console.log("User registered:", form.value);
};
</script>

<template>
  <section class="w-[90%] lg:w-[40%] bg-white rounded-[30px] flex flex-col items-center gap-5 px-6 py-8">
    <h1 class="text-3xl font-semibold text-[#141522]">Kayıt ol</h1>
    <h3 class="text-xl font-normal text-[#141522]">Bilgilerinizi onaylayın</h3>

    <form @submit.prevent="registerUser" class="w-full flex flex-col gap-4">
      <input
        v-model="form.firstName"
        type="text"
        placeholder="Ad"
        class="w-full rounded-xl border-2 border-[#EDEFF7] outline-none p-3 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
      />
      <input
        v-model="form.lastName"
        type="text"
        placeholder="Soyad"
        class="w-full rounded-xl border-2 border-[#EDEFF7] outline-none p-3 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
      />
      <input
        v-model="form.address"
        type="text"
        placeholder="Konum adresi"
        class="w-full rounded-xl border-2 border-[#EDEFF7] outline-none p-3 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
      />
      <input
        v-model="form.phoneOrEmail"
        type="text"
        placeholder="Telefon numarası veya e-posta adresi"
        class="w-full rounded-xl border-2 border-[#EDEFF7] outline-none p-3 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
      />

      <div class="relative w-full">
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Yeni şifre"
          class="w-full rounded-xl border-2 border-[#EDEFF7] outline-none p-3 pr-12 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
        />
        <button type="button" @click="togglePassword" class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
          <SharedEyeClosed v-if="showPassword" />
          <SharedEyeOpen v-else />
        </button>
      </div>

      <input
        v-model="form.confirmPassword"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Şifreyi onaylayın"
        class="w-full rounded-xl border-2 outline-none p-3 pr-12 bg-[#F8F9FF] text-[#9199B1] focus:text-[#141522] transition"
        :class="isPasswordMismatch ? 'border-red-500 text-red-500 focus:border-red-500' : 'border-[#EDEFF7] focus:border-[#0C8CE9]'"
      />

      <button
        type="submit"
        :class="isFormValid ? 'bg-[#0C8CE9] cursor-pointer' : 'bg-[#85CCFF] cursor-not-allowed'"
        class="w-full rounded-xl p-3 text-white font-medium transition-opacity"
        :disabled="!isFormValid"
      >
        Kayıt ol
      </button>
    </form>

    <nuxt-link to="./login" class="text-[#9199B1] text-sm underline">
      Zaten bir hesabınız var mı? Giriş yap!
    </nuxt-link>
  </section>
</template>
