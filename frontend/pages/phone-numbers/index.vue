<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Header -->
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-2xl font-semibold text-gray-900">รายการเบอร์มือถือ</h1>
            <p class="mt-2 text-sm text-gray-700">
              จัดการข้อมูลเบอร์มือถือทั้งหมด
            </p>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <NuxtLink
              to="/phone-numbers/create"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              เพิ่มเบอร์ใหม่
            </NuxtLink>
          </div>
        </div>

        <!-- Filters -->
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <input
              v-model="searchQuery"
              @input="search"
              type="text"
              placeholder="ค้นหาเบอร์..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              v-model="selectedCarrier"
              @change="filterByCarrier"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">ทุกค่าย</option>
              <option value="ais">AIS</option>
              <option value="dtac">DTAC</option>
              <option value="true">TRUE</option>
            </select>
          </div>
          <div>
            <input
              v-model="selectedCategory"
              @input="filterByCategory"
              type="text"
              placeholder="หมวดหมู่..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              @click="clearFilters"
              class="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        <!-- Phone Numbers Table -->
        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เบอร์มือถือ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ค่าย
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  โปรโมชั่น
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันหมดอายุโปร
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันหมดอายุซิม
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">จัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="phoneNumber in phoneNumbers" :key="phoneNumber.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ phoneNumber.phoneNumber }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getCarrierColor(phoneNumber.carrier)"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ phoneNumber.carrier.toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ phoneNumber.category }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ phoneNumber.promotion || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getExpiryStatus(phoneNumber.promotionEndDate)"
                    class="text-sm"
                  >
                    {{ formatDate(phoneNumber.promotionEndDate) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getExpiryStatus(phoneNumber.simExpiryDate)"
                    class="text-sm"
                  >
                    {{ formatDate(phoneNumber.simExpiryDate) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <NuxtLink
                    :to="`/phone-numbers/${phoneNumber.id}`"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    ดู
                  </NuxtLink>
                  <button
                    @click="editPhoneNumber(phoneNumber)"
                    class="text-green-600 hover:text-green-900 mr-4"
                  >
                    แก้ไข
                  </button>
                  <button
                    @click="sendNotification(phoneNumber)"
                    class="text-purple-600 hover:text-purple-900 mr-4"
                    title="ส่งแจ้งเตือน Telegram"
                  >
                    แจ้งเตือน
                  </button>
                  <button
                    @click="deletePhoneNumber(phoneNumber.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                แสดง {{ (currentPage - 1) * limit + 1 }} ถึง {{ Math.min(currentPage * limit, total) }} จาก {{ total }} รายการ
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const router = useRouter()

const phoneNumbers = ref([])
const searchQuery = ref('')
const selectedCarrier = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit.value))

const fetchPhoneNumbers = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value
    }

    if (selectedCarrier.value) params.carrier = selectedCarrier.value
    if (selectedCategory.value) params.category = selectedCategory.value

    const response = await $fetch(`${config.public.apiBase}/phone-numbers`, { params })
    phoneNumbers.value = response.phoneNumbers || []
    total.value = response.total || 0
  } catch (error) {
    console.error('Failed to fetch phone numbers:', error)
  }
}

const search = async () => {
  if (searchQuery.value.trim()) {
    try {
      const response = await $fetch(`${config.public.apiBase}/phone-numbers/search`, {
        params: { q: searchQuery.value }
      })
      phoneNumbers.value = response.phoneNumbers || []
    } catch (error) {
      console.error('Search failed:', error)
    }
  } else {
    await fetchPhoneNumbers()
  }
}

const filterByCarrier = () => {
  currentPage.value = 1
  fetchPhoneNumbers()
}

const filterByCategory = () => {
  currentPage.value = 1
  fetchPhoneNumbers()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCarrier.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
  fetchPhoneNumbers()
}

const editPhoneNumber = (phoneNumber) => {
  router.push(`/phone-numbers/edit/${phoneNumber.id}`)
}

const deletePhoneNumber = async (id) => {
  if (confirm('คุณต้องการลบเบอร์นี้หรือไม่?')) {
    try {
      await $fetch(`${config.public.apiBase}/phone-numbers/${id}`, {
        method: 'DELETE'
      })
      await fetchPhoneNumbers()
    } catch (error) {
      console.error('Failed to delete phone number:', error)
    }
  }
}

const sendNotification = async (phoneNumber) => {
  // Check which type of notification to send based on what's expiring sooner
  let notificationType = 'promotion'

  if (phoneNumber.simExpiryDate && phoneNumber.promotionEndDate) {
    const simExpiry = new Date(phoneNumber.simExpiryDate)
    const promoExpiry = new Date(phoneNumber.promotionEndDate)

    if (simExpiry < promoExpiry) {
      notificationType = 'sim'
    }
  } else if (phoneNumber.simExpiryDate && !phoneNumber.promotionEndDate) {
    notificationType = 'sim'
  }

  const typeText = notificationType === 'sim' ? 'ซิม' : 'โปรโมชั่น'

  if (confirm(`ส่งแจ้งเตือน${typeText}หมดอายุสำหรับเบอร์ ${phoneNumber.phoneNumber}?`)) {
    try {
      await $fetch(`${config.public.apiBase}/notifications/telegram/send/${phoneNumber.id}?type=${notificationType}`, {
        method: 'POST'
      })
      alert('ส่งแจ้งเตือนสำเร็จ')
    } catch (error) {
      console.error('Failed to send notification:', error)
      alert('เกิดข้อผิดพลาดในการส่งแจ้งเตือน')
    }
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchPhoneNumbers()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPhoneNumbers()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH')
}

const getCarrierColor = (carrier) => {
  switch (carrier) {
    case 'ais':
      return 'bg-green-100 text-green-800'
    case 'dtac':
      return 'bg-blue-100 text-blue-800'
    case 'true':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getExpiryStatus = (dateString) => {
  if (!dateString) return 'text-gray-500'

  const expiryDate = new Date(dateString)
  const today = new Date()
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-600 font-bold' // หมดอายุแล้ว
  if (diffDays <= 7) return 'text-orange-600 font-semibold' // ใกล้หมดอายุ
  if (diffDays <= 30) return 'text-yellow-600' // เตือน
  return 'text-green-600' // ปกติ
}

onMounted(() => {
  fetchPhoneNumbers()
})

useHead({
  title: 'รายการเบอร์มือถือ - ระบบบันทึกข้อมูลเบอร์มือถือ'
})
</script>