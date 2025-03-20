<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

import { ref } from "vue";

const activeTab = ref("login");
const changeTab = (tab: string) => {
  activeTab.value = tab;
};
</script>

<template>
  <section class="w-[90%] lg:w-[40%] bg-white rounded-[30px] flex flex-col items-center gap-5">
    <!-- Sahifalar -->
    <LayoutsAuthLogin v-if="activeTab === 'login'"  @change-tab="changeTab" />
    <LayoutsAuthRegister  v-if="activeTab === 'register'"  @change-tab="changeTab"/>
  </section>
</template>
