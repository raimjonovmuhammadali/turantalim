<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

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

const localData = ref({ ...props.formData });

// ✅ FormData o‘zgarganda localData-ni update qilish
watch(
  () => props.formData,
  (newVal) => {
    localData.value = { ...newVal };
  },
  { deep: true }
);

// ✅ localData o‘zgarganda emit qilish
watch(
  localData,
  (newVal) => {
    emit("update:formData", newVal);
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
  </div>
</template>
