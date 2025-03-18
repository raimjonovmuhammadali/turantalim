<script setup>

const isUserVisible = ref(false);

const toggleUser = () => {
  isUserVisible.value = !isUserVisible.value;
};

</script>
<template>
  <section
    class="w-full bg-[#DBEFFF] flex flex-col items-center py-5"
  >
    <div class="w-[90%] mx-auto flex flex-col justify-start gap-5">
      <LayoutsProfileNavbar @toggle-user="toggleUser" />
      <LayoutsProfileUser v-if="isUserVisible"/>
      <slot />
    </div>
  </section>
</template>
