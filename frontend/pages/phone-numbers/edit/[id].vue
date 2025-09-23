<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Header -->
        <div class="mb-8">
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-4">
              <li>
                <NuxtLink to="/phone-numbers" class="text-gray-400 hover:text-gray-500">
                  รายการเบอร์มือถือ
                </NuxtLink>
              </li>
              <li>
                <span class="text-gray-400">/</span>
              </li>
              <li>
                <span class="text-gray-900">แก้ไขเบอร์</span>
              </li>
            </ol>
          </nav>
          <h1 class="mt-4 text-2xl font-semibold text-gray-900">แก้ไขข้อมูลเบอร์มือถือ</h1>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Edit Form -->
        <div v-else-if="phoneNumber" class="bg-white shadow rounded-lg">
          <form @submit.prevent="updatePhoneNumber" class="space-y-6 p-6">
            <!-- Phone Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700">เบอร์มือถือ *</label>
              <input
                v-model="phoneNumber.phoneNumber"
                type="text"
                required
                placeholder="081-234-5678"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <!-- Carrier -->
            <div>
              <label class="block text-sm font-medium text-gray-700">ค่าย *</label>
              <select
                v-model="phoneNumber.carrier"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">เลือกค่าย</option>
                <option value="ais">AIS</option>
                <option value="dtac">DTAC</option>
                <option value="true">TRUE</option>
              </select>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700">หมวดหมู่ *</label>
              <input
                v-model="phoneNumber.category"
                type="text"
                required
                placeholder="ส่วนตัว, งาน, ครอบครัว..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <!-- Promotion -->
            <div>
              <label class="block text-sm font-medium text-gray-700">โปรโมชั่น</label>
              <input
                v-model="phoneNumber.promotion"
                type="text"
                placeholder="เน็ตไม่อั้น 30GB"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <!-- Promotion Dates -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">วันเริ่มโปร</label>
                <input
                  v-model="promotionStartDate"
                  type="date"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">วันหมดอายุโปร</label>
                <input
                  v-model="promotionEndDate"
                  type="date"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- SIM Expiry -->
            <div>
              <label class="block text-sm font-medium text-gray-700">วันหมดอายุซิม</label>
              <input
                v-model="simExpiryDate"
                type="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700">หมายเหตุ</label>
              <textarea
                v-model="phoneNumber.notes"
                rows="3"
                placeholder="บันทึกเพิ่มเติม..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-800">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <NuxtLink
                to="/phone-numbers"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </NuxtLink>
              <button
                type="submit"
                :disabled="updating"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span v-if="updating" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
                <span v-else>บันทึกการแก้ไข</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12">
          <div class="rounded-md bg-red-50 p-4 max-w-md mx-auto">
            <p class="text-red-800">ไม่พบข้อมูลเบอร์มือถือ</p>
            <NuxtLink to="/phone-numbers" class="mt-2 text-blue-600 hover:text-blue-800 underline">
              กลับไปหน้ารายการ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// State
const phoneNumber = ref(null)
const loading = ref(true)
const updating = ref(false)
const error = ref('')

// Computed properties for date formatting
const promotionStartDate = computed({
  get() {
    return phoneNumber.value?.promotionStartDate ?
      new Date(phoneNumber.value.promotionStartDate).toISOString().split('T')[0] : ''
  },
  set(value) {
    if (phoneNumber.value && value) {
      phoneNumber.value.promotionStartDate = new Date(value).toISOString()
    }
  }
})

const promotionEndDate = computed({
  get() {
    return phoneNumber.value?.promotionEndDate ?
      new Date(phoneNumber.value.promotionEndDate).toISOString().split('T')[0] : ''
  },
  set(value) {
    if (phoneNumber.value && value) {
      phoneNumber.value.promotionEndDate = new Date(value).toISOString()
    }
  }
})

const simExpiryDate = computed({
  get() {
    return phoneNumber.value?.simExpiryDate ?
      new Date(phoneNumber.value.simExpiryDate).toISOString().split('T')[0] : ''
  },
  set(value) {
    if (phoneNumber.value && value) {
      phoneNumber.value.simExpiryDate = new Date(value).toISOString()
    }
  }
})

// Fetch phone number data
const fetchPhoneNumber = async () => {
  try {
    loading.value = true
    const response = await $fetch(`${config.public.apiBase}/phone-numbers/${route.params.id}`)
    phoneNumber.value = response
  } catch (err) {
    console.error('Failed to fetch phone number:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    loading.value = false
  }
}

// Update phone number
const updatePhoneNumber = async () => {
  try {
    updating.value = true
    error.value = ''

    await $fetch(`${config.public.apiBase}/phone-numbers/${route.params.id}`, {
      method: 'PUT',
      body: phoneNumber.value
    })

    // Redirect to phone numbers list
    await router.push('/phone-numbers')
  } catch (err) {
    console.error('Failed to update phone number:', err)
    error.value = 'ไม่สามารถบันทึกการแก้ไขได้'
  } finally {
    updating.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchPhoneNumber()
})

// Page meta
useHead({
  title: 'แก้ไขเบอร์มือถือ - ระบบจัดการเบอร์มือถือ'
})
</script>