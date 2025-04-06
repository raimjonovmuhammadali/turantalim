import { defineStore } from "pinia";
import { fetchData } from "@/utils/api";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    profileData: null as Record<string, any> | null,
    errorMessage: "",
  }),
  actions: {
    async fetchProfile() {
      const username = localStorage.getItem("phone");
      if (!username) {
        this.errorMessage = "Siz login qilmagansiz!";
        return navigateTo("/auth/");
      }

      try {
        this.profileData = await fetchData(`/user/profile/?username=${username}`);
        localStorage.setItem("profileData", JSON.stringify(this.profileData));
      } catch (error) {
        this.errorMessage = "Profil ma’lumotlarini olishda xatolik yuz berdi.";
      }
    },

    async updateProfile(updatedData: Record<string, any>) {
      try {
        await fetchData("/user/profile/update/", {
          method: "PUT",
          body: JSON.stringify(updatedData),
        });

        this.profileData = { ...this.profileData, ...updatedData };
        localStorage.setItem("profileData", JSON.stringify(this.profileData));

        return true;
      } catch (error) {
        return false;
      }
    },

    logout() {
      this.profileData = null;
      localStorage.removeItem("profileData");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("phone");
      navigateTo("/");
    },
  },
});
