import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  pages: true,
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: "Turan Ta'lim",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Turan Ta\'lim - turk tilini biz bilan samarali o\'rganing!' },
        { name: 'keywords', content: 'ta\'lim, o\'quv, kurslar, uzbekistan, turan talim, turk tili, multilevel, TYS, testlar, milliy sertifikat' },
        { name: 'author', content: 'Muhammadali Rayimjonov' },
        // Open Graph teglari
        { property: 'og:title', content: 'Turan Ta\'lim' },
        { property: 'og:description', content: 'Turan Ta\'lim - turk tilini biz bilan samarali o\'rganing!' },
        { property: 'og:image', content: 'https://turantalim.uz/prewiev.png' },
        { property: 'og:url', content: 'https://turantalim.uz' },
        { property: 'og:type', content: 'website' },
        // Twitter Card teglari
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Turan Ta\'lim' },
        { name: 'twitter:description', content: 'Turan Ta\'lim - turk tilini biz bilan samarali o\'rganing!' },
        { name: 'twitter:image', content: 'https://turantalim.uz/prewiev.png' }
      ],
      htmlAttrs: {
        lang: "uz", // Faqat boshlang‘ich til
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
    },
  },
});
