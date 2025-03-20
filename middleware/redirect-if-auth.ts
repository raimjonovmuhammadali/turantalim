export default defineNuxtRouteMiddleware(() => {
    if (process.client) {
      const key = localStorage.getItem('access_token'); // LocalStorage'dagi keyni tekshirish
      if (key) {
        return navigateTo('/'); // Agar tizimga kirgan bo'lsa, bosh sahifaga o'tish
      }
    }
  });
  