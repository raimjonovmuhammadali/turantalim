<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useBalanceStore } from "@/stores/balance";
const balanceStore = useBalanceStore();

const route = useRoute();
const router = useRouter();

const level = ref(route.query.level || "multilevel");
const tests = ref([]);
const isLoading = ref(true);
const error = ref("");

// Modal uchun
const showModal = ref(false);
const selectedPrice = ref(0);
const missingAmount = ref(0);

onMounted(async () => {
  balanceStore.getBalance();
  try {
    const token = localStorage.getItem("access_token");
    localStorage.setItem("selectedLevel", level.value); // 🔐 level-ni saqlab qo'yamiz

    const res = await fetch(
      `${API_BASE_URL}/multilevel/exams/?level=${level.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Testlarni olishda xatolik.");
    const data = await res.json();
    tests.value = data;
  } catch (err) {
    error.value = err.message || "Xatolik yuz berdi.";
  } finally {
    isLoading.value = false;
  }
});

async function handleStartTest(testId: number) {
  const selectedTest = tests.value.exams.find((t) => t.id === testId);
  const price = selectedTest?.price || 0;
  selectedPrice.value = price;

  if (balanceStore.balance >= price) {
    // ✅ Balans yetarli
    localStorage.setItem("selectedExamId", testId.toString());

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/payment/exampayment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exam: testId }),
      });

      const data = await res.json();
      console.log("✅ To‘lov javobi:", data);
    } catch (err) {
      console.error("❌ To‘lov so‘rovida xatolik:", err);
    }

    router.push("/tests/milliy");
  } else {
    // ❌ Balans yetarli emas - modal ko‘rsatamiz
    missingAmount.value = price - balanceStore.balance;
    showModal.value = true;
  }
}

</script>

<template>
  <section class="min-h-screen bg-[#DBEFFF] py-6">
    <!-- Header -->
    <nav class="w-[90%] mx-auto bg-white p-4 rounded-2xl flex items-center justify-center mb-6 shadow">
      <img src="~/assets/images/logo.png" alt="logo" width="50" />
    </nav>

    <!-- Title -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-[#141522]">📝 Testlerin listesi</h1>
      <p class="text-gray-600 mt-2">
        Seçilen seviye: <strong>{{ level }}</strong>
      </p>
    </div>

    <!-- Loading/Error -->
    <div v-if="isLoading" class="text-center text-gray-500">Yükleniyor...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

    <!-- Test Cards -->
    <div
      v-else
      class="w-[90%] mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="test in tests?.exams"
        :key="test.id"
        class="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-xl transition"
      >
        <div>
          <h2 class="text-xl font-semibold text-[#0C8CE9] mb-2">
            {{ test.title }}
          </h2>
          <p class="text-gray-700 text-sm mb-4">
            {{ test.description || "Açıklama mevcut değil." }}
          </p>
        </div>

        <div class="mt-auto">
          <p class="text-gray-500 mb-3">
            💰 <span class="font-semibold text-black">{{ test.price || "Özgür" }}</span> so'm
          </p>
          <nuxt-link
            @click.prevent="handleStartTest(test.id)"
            class="inline-block w-full text-center bg-[#0C8CE9] hover:bg-[#0074c7] text-white py-2 rounded-xl font-medium transition"
          >
            🚀 Testi başlat
          </nuxt-link>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="w-full text-center mt-10">
      <nuxt-link
        to="/"
        class="text-gray-600 underline hover:text-[#0C8CE9] transition"
      >
        ← Ana sayfa
      </nuxt-link>
    </div>

    <!-- Modal: Balans Yetarli Emas -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl w-[90%] max-w-md text-center space-y-4">
          <h2 class="text-xl font-bold text-red-600">❌ Yetersiz bakiye mevcut</h2>
          <p>
            Bu sınavın başlangıç ücreti <strong>{{ selectedPrice }}</strong> soum'dur. <br />
            Bu sınavın başlangıç fiyatı <strong>{{ balanceStore.balance }}</strong> soum.
          </p>
          <p>
            Eksiklik: <strong>{{ missingAmount }} toplamı</strong>
          </p>
          <nuxt-link
            to="/profile/balance"
            class="inline-block bg-[#0C8CE9] text-white px-4 py-2 rounded-md hover:bg-[#0074c7] transition"
          >
            💳 Hesabınıza para yatırın
          </nuxt-link>
          <button @click="showModal = false" class="block w-full mt-3 text-gray-600 underline">
            İptal etmek
          </button>
        </div>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
