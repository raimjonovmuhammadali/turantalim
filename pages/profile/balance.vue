<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

import { onMounted } from 'vue'
import { useBalanceStore } from '@/stores/balance'

const balanceStore = useBalanceStore()

onMounted(() => {
  balanceStore.getBalance()
})



const isChecked = ref('')
</script>
<template>
  <section
    class="w-full h-[81vh] bg-white p-5 rounded-[30px] text-[#141522] flex flex-col md:flex-row gap-3 md:gap-0  justify-start md:justify-between"
  >
    <div
      class="balance shadow-md rounded-[10px] p-4 w-full md:w-[410px] h-[100px] flex items-center gap-5"
    >
      <Icon name="uil:wallet" class="text-[#0C8CE9] text-[50px]" />
      <div class="">
        <span class="text-[#9D9DA9] font-[500]">Mevcut hesap bakiyesi</span>
        <h1 class="font-[600] text-[24px] text-[#0C8CE9]">{{balanceStore.balance}} so‘m</h1>
      </div>
    </div>

    <div class="balance-form w-full md:w-6/12">
      <form action="" class="flex flex-col gap-3">
        <h1 class="text-[32px] font-semibold text-[#141522]">Giriş yap</h1>
        <input
          type="text"
          placeholder="Yükleme miktarı(UZS)"
          class="w-full h-[48px] rounded-xl border-2 border-[#EDEFF7] outline-none px-5 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
        />
        <input
          type="text"
          placeholder="Kart numarası"
          class="w-full h-[48px] rounded-xl border-2 border-[#EDEFF7] outline-none px-5 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
        />
        <input
          type="text"
          placeholder="Son kullanma tarihi"
          class="w-full h-[48px] rounded-xl border-2 border-[#EDEFF7] outline-none px-5 bg-[#F8F9FF] text-[#9199B1] focus:border-[#0C8CE9] focus:text-[#141522] transition"
        />
        <div class="chekbox flex items-center gap-2">
          <input type="checkbox" id="check" v-model="isChecked">
          <label for="check">Kartayı kaydet</label>
        </div>
        <button
        type="submit"
        :class="isChecked ? 'bg-[#0C8CE9] cursor-pointer' : 'bg-[#85CCFF] cursor-not-allowed'"
        class="w-[178px] h-[48px] rounded-xl text-white font-medium transition-opacity"
        :disabled="!isChecked"
      >
      Yükle
      </button>
      </form>
    </div>
  </section>
</template>
