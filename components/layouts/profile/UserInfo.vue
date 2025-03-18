<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps<{ 
  title: string; // 🟢 Title alohida olingan
  formData: Record<string, any>; 
  fields: { id: string; label: string; placeholder: string }[]; 
}>();

const emit = defineEmits(["update:formData"]);

// `localData` - formdagi malumotlarni saqlash uchun
const localData = ref({ ...props.formData });

// `localData` o'zgarsa, `formData` ga o‘zgartirishlarni jo‘natish
watch(localData, (newValue) => {
  emit("update:formData", newValue);
}, { deep: true });
</script>

<template>
  <div class="w-full form-user flex flex-col gap-4">
    <h1 class="text-[32px] font-[600]">{{ title }}</h1> <!-- ✅ Title to'g'ri ishlaydi -->

    <div class="w-full form-input flex flex-wrap gap-4">
      <div v-for="field in fields" :key="field.id" class="w-[45%] form-label flex flex-col gap-2">
        <label :for="field.id">{{ field.label }}</label>
        <input
          type="text"
          :id="field.id"
          v-model="localData[field.id]"
          :placeholder="field.placeholder"
          class="p-2 w-full border border-[#EDEFF7] bg-[#F8F9FF] rounded-[10px] outline-none"
        />
      </div>
    </div>
  </div>
</template>
