<script setup lang="ts">
import { useProfileStore } from "@/stores/profile";
import { useToast } from "#imports";
import { fetchData } from "@/utils/api";

definePageMeta({ layout: "profile" });

const toast = useToast();
const profileStore = useProfileStore();
const isLoading = ref(true);
const userData = ref({
  name: "",
  surname: "",
  birthdate: "",
  gender: "",
  phone: "",
  email: "",
});

onMounted(async () => {
  const cachedProfile = localStorage.getItem("profileData");
  if (cachedProfile) {
    profileStore.profileData = JSON.parse(cachedProfile);
  } else {
    await profileStore.fetchProfile();
  }
  isLoading.value = false;
});

const handleSubmit = async () => {
  if (!profileStore.profileData) return;

  const updatedData = {
    first_name: userData.value.name || profileStore.profileData.first_name,
    last_name: userData.value.surname || profileStore.profileData.last_name,
    birthdate: userData.value.birthdate || profileStore.profileData.birthdate,
    gender: userData.value.gender || profileStore.profileData.gender,
    phone: userData.value.phone || profileStore.profileData.phone,
    email: userData.value.email || profileStore.profileData.email,
  };

  try {
    const success = await profileStore.updateProfile(updatedData);
    if (success) {
      alert("Ma'lumotlar yangilandi...")
    } else {
      throw new Error("Ma'lumotlarni yangilashda muammo yuz berdi.");
    }
  } catch (err) {
    console.error("Xato:", err);
    toast.add({
      title: "Xatolik!",
      description: "Ma'lumotlarni yangilashda muammo yuz berdi.",
    });
  }
};

watch(
  () => profileStore.profileData,
  (newProfile) => {
    if (newProfile) {
      userData.value = {
        name: newProfile.first_name || "",
        surname: newProfile.last_name || "",
        birthdate: newProfile.birthdate || "",
        gender: newProfile.gender || "",
        phone: newProfile.phone || "",
        email: newProfile.email || "",
      };
    }
  },
  { immediate: true }
);
</script>

<template>
  <section class="w-full bg-white p-5 rounded-[30px] text-[#141522]">
    <div class="w-[90%] mx-auto flex flex-col gap-5">
      <template v-if="isLoading">
        <div class="flex items-center gap-5">
          <USkeleton class="w-[55px] h-[55px] rounded-full" />
          <div>
            <USkeleton class="h-6 w-40 mb-2" />
            <USkeleton class="h-4 w-32" />
          </div>
        </div>
        <hr class="text-[#F6F6F6] h-2" />
        <USkeleton class="h-10 w-full rounded-md" />
        <USkeleton class="h-10 w-full rounded-md mt-2" />
        <USkeleton class="h-10 w-full rounded-md mt-2" />
      </template>

      <template v-else>
        <div v-if="profileStore.profileData" class="userinfo flex items-center gap-5">
          <img src="~/assets/images/logo.png" alt="user img" loading="lazy" width="55px" height="55px" />
          <div>
            <h1 class="font-[600] text-[24px]">
              {{ profileStore.profileData.first_name }}
            </h1>
            <span class="text-[#9D9DA9] font-[500]">{{ profileStore.profileData.email }}</span>
          </div>
        </div>

        <hr class="text-[#F6F6F6] h-2" />

        <LayoutsProfileUserInfo
          v-if="profileStore.profileData"
          title="Kişisel Bilgiler"
          :formData="userData"
          :fields="[
            { id: 'name', label: 'İsim', type: 'text' },
            { id: 'surname', label: 'Soyadı', type: 'text' },
            { id: 'birthdate', label: 'Doğum tarihiniz', type: 'date' },
            { id: 'gender', label: 'Cinsiyet', type: 'select', options: [{ value: 'male', label: 'Erkek' }, { value: 'female', label: 'Kadın' }] },
            { id: 'phone', label: 'Telefon numarası', type: 'number' },
            { id: 'email', label: 'E-posta', type: 'email' },
          ]"
          v-model:formData="userData"
        />

        <button @click="handleSubmit" class="mt-4 w-[200px] cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md">
          Değişiklikleri kaydet
        </button>
      </template>
    </div>
  </section>
</template>
