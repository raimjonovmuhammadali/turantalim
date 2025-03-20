<script setup lang="ts">
import { ref, defineEmits } from "vue";

const isMenuOpen = ref(false);
const emit = defineEmits(["toggle-user"]);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  emit('toggle-user')
};
</script>

<template>
  <header class="w-full h-[10vh] p-4 flex items-center justify-between bg-white rounded-[30px] shadow-md">
    <img src="~/assets/images/logo.png" alt="Logo" class="h-10" loading="lazy">
    
    <!-- Hamburger menyu -->
    <button @click="toggleMenu" class="p-2 rounded-md focus:outline-none">
      <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#0C8CE9] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#0C8CE9] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </header>
</template>