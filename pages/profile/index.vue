<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const profileData = ref<Record<string, any> | null>(null);
const errorMessage = ref("");

// **Foydalanuvchi ma'lumotlari modeli**
const userData = ref({
  name: "",
  surname: "",
  birthdate: "",
  gender: "",
  phone: "",
  email: "",
  language: "",
});

// **Profil ma'lumotlarini olish**
const fetchProfile = async () => {
  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");

  if (!username || !token) {
    errorMessage.value = "Siz login qilmagansiz!";
    return router.push("/auth/login");
  }

  try {
    const data = await $fetch(
      `https://turantalim2.pythonanywhere.com/user/profile/?username=${username}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    profileData.value = data;
    userData.value = {
      name: data.first_name || "",
      surname: data.last_name || "",
      birthdate: data.birthdate || "",
      gender: data.gender || "",
      phone: data.phone || "",
      email: data.email || "",
    };
  } catch (err: any) {
    if (err.response?.status === 401) {
      errorMessage.value = "Token muddati tugagan. Iltimos, qayta login qiling!";
      localStorage.removeItem("access_token");
      return router.push("/auth/login");
    }
    errorMessage.value = err.data?.message || "Profil ma’lumotlarini olishda xatolik yuz berdi.";
  }
};

onMounted(fetchProfile);

// **Profilni yangilash**
const handleSubmit = async () => {
  if (!profileData.value) return;

  const token = localStorage.getItem("access_token");

  try {
    const updatedData = {
      first_name: userData.value.name || profileData.value.first_name,
      last_name: userData.value.surname || profileData.value.last_name,
      birthdate: userData.value.birthdate || profileData.value.birthdate,
      gender: userData.value.gender || profileData.value.gender,
      phone: userData.value.phone || profileData.value.phone,
      email: userData.value.email || profileData.value.email,
    };

    await $fetch("https://turantalim2.pythonanywhere.com/user/profile/update/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    alert("O'zgarishlar muvaffaqiyatli saqlandi!");

    // **Profil ma'lumotlarini yangilash (ortiqcha API chaqirish emas)**
    profileData.value = { ...profileData.value, ...updatedData };

    // **Forma ma’lumotlarini tozalash**
    userData.value = {
      name: "",
      surname: "",
      birthdate: "",
      gender: "",
      phone: "",
      email: "",
    };
  } catch (err) {
    console.error("Xato:", err);
    alert("Xatolik yuz berdi, qayta urinib koʻring.");
  }
};
</script>

<template>
  <section class="w-full bg-white p-5 rounded-[30px] text-[#141522]">
    <div class="w-[90%] mx-auto flex flex-col gap-5">
      <div v-if="profileData" class="userinfo flex items-center gap-5">
        <img
          src="~/assets/images/logo.png"
          alt="user img"
          loading="lazy"
          width="55px"
          height="55px"
        />
        <div>
          <h1 class="font-[600] text-[24px]">{{ profileData.first_name }}</h1>
          <span class="text-[#9D9DA9] font-[500]">{{ profileData.email }}</span>
        </div>
      </div>

      <hr class="text-[#F6F6F6] h-2" />

      <!-- Shaxsiy ma'lumotlar -->
      <LayoutsProfileUserInfo
        v-if="profileData"
        title="Kişisel Bilgiler"
        :formData="userData"
        :fields="[
          { id: 'name', label: 'İsim', placeholder: profileData.first_name },
          { id: 'surname', label: 'Soyadı', placeholder: profileData.last_name },
          { id: 'birthdate', label: 'Doğum tarihiniz', placeholder: profileData.birthdate || '01/01/1990' },
          { id: 'gender', label: 'Cinsiyet', placeholder: profileData.gender || 'Erkek / Kadın' },
        ]"
        v-model:formData="userData"
      />

      <!-- Aloqa ma'lumotlari -->
      <LayoutsProfileUserInfo
        v-if="profileData"
        title="Yetkilendirme Bilgileri"
        :formData="userData"
        :fields="[
          { id: 'phone', label: 'Telefon numarası', placeholder: profileData.phone },
          { id: 'email', label: 'E-posta', placeholder: profileData.email },
        ]"
        v-model:formData="userData"
      />


      <button
        @click="handleSubmit"
        class="mt-4 w-[200px] cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Değişiklikleri kaydet
      </button>
    </div>
  </section>
</template>
