<template>
  <section class="w-[90%] h-[50px] mx-auto bg-white p-2 rounded-full flex items-center gap-2 px-5">
    <img src="~/assets/svg/headphone.svg" alt="svg" width="30px" />
    <h1 class="font-[600]">{{ title }}</h1>
    <div class="relative w-full bg-gray-500 h-2 overflow-hidden rounded-full">
      <div
        class="absolute top-0 left-0 h-full bg-[#0C8CE9] transition-all rounded-full"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
    <p class="text-gray-700 text-[20px] font-semibold">
      {{ formattedTime }}
    </p>
    <Icon name="uil:clock" class="text-[#0C8CE9] text-[20px] font-[600]" />
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  remainingTime: {
    type: Number,
    required: true,
  },
  totalTime: {
    type: Number,
    required: true,
  },
});


const progress = computed(() => (props.remainingTime / props.totalTime) * 100);

const formattedTime = computed(() => {
  const mins = Math.floor(props.remainingTime / 60);
  const secs = props.remainingTime % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
});
</script>
