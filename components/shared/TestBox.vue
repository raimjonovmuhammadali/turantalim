<script setup lang="ts">
import { defineProps } from "vue";
import type { Box } from "~/types";

defineProps<{ box: Box }>();
</script>
<template>
  <nuxt-link
    :to="{ path: box.link, query: { level: box.title } }"
    class="w-full md:w-[32%] box py-5 rounded-[15px] text-white flex items-center justify-center gap-5"
    :style="{ backgroundColor: box.color }"
  >
    <h4 class="text-[40px] font-[600] capitalize">{{ box.title }}</h4>
    <span class="text-[20px] w-[150px]">{{ box.hero }}</span>
  </nuxt-link>
</template>

