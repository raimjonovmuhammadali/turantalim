// stores/balance.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useBalanceStore = defineStore('balance', () => {
  const balance = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const getBalance = async () => {
    isLoading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        'https://turantalim2.pythonanywhere.com/payment/balance/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      balance.value = response.data.balance
    } catch (err) {
      console.error('❌ Balance olishda xatolik:', err)
      error.value = err.response?.data || 'Server xatosi'
    } finally {
      isLoading.value = false
    }
  }

  return {
    balance,
    isLoading,
    error,
    getBalance,
  }
})
