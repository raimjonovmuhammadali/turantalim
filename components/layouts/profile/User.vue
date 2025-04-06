<script setup lang="ts">

const profileStore = useProfileStore();

</script>
<template>
    <section class="w-[90%] md:w-[30%] py-3 px-5 bg-white rounded-[30px] text-[#141522] flex flex-col gap-3 absolute  md:right-20 top-30 shadow-md">
        <nuxt-link to="/profile" class="userinfo flex items-center gap-5">
            <img src="~/assets/images/logo.png" alt="user img" loading="lazy" width="55px" height="55px">
            <div class="">
                <h1 class="font-[600] text-[24px]">{{ profileStore.profileData.first_name}}</h1>
                <span class="text-[#9D9DA9] font-[500]">{{ profileStore.profileData.phone }}</span>
            </div>
        </nuxt-link>
        <hr class="text-[#F6F6F6] h-2">
        <nuxt-link to="./balance" class="balance flex items-center gap-5">
            <Icon name="uil:wallet" class="text-[#0C8CE9] text-[50px]"/>
            <div class="">
                <span class="text-[#9D9DA9] font-[500]">Hesabım</span>
                <h1 class="font-[600] text-[24px]">200 000 so‘m</h1>
            </div>
        </nuxt-link>
        <hr class="text-[#F6F6F6] h-2">
        <div class="flex flex-col gap-2 mt-2">
            <nuxt-link to="/profile" class="font-[600] text-[24px]">Profil</nuxt-link>
            <nuxt-link to="/" class="font-[600] text-[24px]">Ana sayfa</nuxt-link>
        </div>
        <hr class="text-[#F6F6F6] h-2">
        <h1 class="font-[600] text-[24px] text-[#EA3A00] cursor-pointer" @click="profileStore.logout()">Profilden çıkış</h1>
    </section>
</template>