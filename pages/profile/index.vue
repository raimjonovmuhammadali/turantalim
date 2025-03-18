<script setup lang="ts">
definePageMeta({
  layout: "profile",
});
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const profileData = ref(null);
const errorMessage = ref("");
const userData = ref({
  name: "",
  surname: "",
  birthdate: "",
  gender: "",
});
const fetchProfile = async () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("access_token");

  if (!username || !token) {
    errorMessage.value = "Siz login qilmagansiz!";
    return router.push("/auth/login");
  }

  try {
    profileData.value = await $fetch(
      `https://turantalim2.pythonanywhere.com/user/profile/?username=${username}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ TO‘G‘RI FORMATDA YUBORILDI
        },
      }
    );
    userData.value = {
      name: profileData.first_name || "",
      surname: profileData.last_name || "",
      birthdate: profileData.birthdate || "",
      gender: profileData.gender || "",
    };
  } catch (err: any) {
    if (err.response?.status === 401) {
      errorMessage.value =
        "Token muddati tugagan. Iltimos, qayta login qiling!";
      localStorage.removeItem("access_token");
      router.push("/auth/login");
    } else {
      errorMessage.value =
        err.data?.message || "Profil ma’lumotlarini olishda xatolik yuz berdi.";
    }
  }
};

onMounted(fetchProfile);
</script>
<template>
  <section class="w-full bg-white p-5 rounded-[30px] text-[#141522]">
    <div class="w-[90%] mx-auto flex flex-col gap-5">
      <div class="userinfo flex items-center gap-5" v-if="profileData">
        <img
          src="~/assets/images/logo.png"
          alt="user img"
          loading="lazy"
          width="55px"
          height="55px"
        />
        <div class="">
          <h1 class="font-[600] text-[24px]">{{ profileData.first_name }}</h1>
          <span class="text-[#9D9DA9] font-[500]">{{ profileData.email }}</span>
        </div>
      </div>

      <hr class="text-[#F6F6F6] h-2" />

      <LayoutsProfileUserInfo
      v-if="profileData"
        :formData="userData"
        :fields="[
          { id: 'name', label: 'İsim', placeholder: profileData.first_name },
          { id: 'surname', label: 'Soyadı', placeholder: profileData.last_name },
          {
            id: 'birthdate',
            label: 'Doğum tarihiniz',
            placeholder: '01/01/1990',
          },
          { id: 'gender', label: 'Cinsiyet', placeholder: 'Erkek / Kadın' },
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
