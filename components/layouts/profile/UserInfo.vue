<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

// Props va Emit
const props = defineProps<{ 
  title: string; 
  formData: Record<string, any>; 
  fields: { 
    id: string; 
    label: string; 
    type: string; 
    options?: { value: string; label: string }[] 
  }[]; 
}>();

const emit = defineEmits(["update:formData"]);

// Local nusxa
const localData = ref({ ...props.formData });

// formData o‘zgarganda localData-ni yangilash
watch(
  () => props.formData,
  (newVal) => {
    localData.value = { ...newVal };
  },
  { deep: true }
);

// 🔧 Debounce bilan emit qilish (siklga tushishni oldini olish)
let timeout: ReturnType<typeof setTimeout> | null = null;

watch(
  localData,
  (newVal) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      emit("update:formData", newVal);
    }, 300);
  },
  { deep: true }
);
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <h1 class="text-[24px] font-semibold">{{ title }}</h1>

    <div class="w-full flex flex-wrap gap-4">
      <div
        v-for="field in fields"
        :key="field.id"
        class="w-[45%] flex flex-col gap-2"
      >
        <label :for="field.id" class="text-gray-700">{{ field.label }}</label>

        <!-- Text, Email, Number, Date -->
        <input
          v-if="['text', 'email', 'number', 'date'].includes(field.type)"
          :type="field.type"
          :id="field.id"
          v-model="localData[field.id]"
          class="p-2 w-full border border-gray-300 bg-gray-100 rounded-md outline-none"
        />

        <!-- Select -->
        <select
          v-else-if="field.type === 'select'"
          :id="field.id"
          v-model="localData[field.id]"
          class="p-2 w-full border border-gray-300 bg-gray-100 rounded-md outline-none"
        >
          <option value="">Tanlang</option>
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 🔍 Debug maqsadida -->
    <!-- <pre>{{ localData }}</pre> -->
  </div>
</template>
