<script setup>
const loading = ref(true);
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>
<template>
  <div
    v-if="loading"
    class="w-full h-[100vh] fixed inset-0 flex flex-col items-center gap-5 justify-center bg-[#61B7FF] z-50"
  >
    <div class="relative flex items-center justify-center w-[250px] h-[250px]">
      <!-- Loader rasmi (harakatsiz) -->
      <img
        src="~/assets/images/loader.svg"
        alt="Loading..."
        class="absolute w-[250px] h-[250px]"
        loading="lazy"
      />

      <!-- Aylanadigan chegara -->
      <div
        class="w-[250px] h-[250px] border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
      ></div>
    </div>
    <h1 class="text-[60px] font-[600] text-white">Sevdiğim Yerdeyim</h1>
  </div>

  <div v-else>
    <slot />
  </div>
</template>
