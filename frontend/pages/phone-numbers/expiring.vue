<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Header -->
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-2xl font-semibold text-gray-900">เบอร์ที่ใกล้หมดอายุ</h1>
            <p class="mt-2 text-sm text-gray-700">
              ตรวจสอบเบอร์ที่จะหมดอายุในระยะเวลาที่กำหนด
            </p>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <NuxtLink
              to="/phone-numbers"
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              กลับไปรายการทั้งหมด
            </NuxtLink>
          </div>
        </div>

        <!-- Filters -->
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">ประเภทการหมดอายุ</label>
            <select
              v-model="expiryType"
              @change="fetchExpiringNumbers"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="promotion">โปรโมชั่น</option>
              <option value="sim">ซิม</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">จำนวนวันล่วงหน้า</label>
            <select
              v-model="days"
              @change="fetchExpiringNumbers"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="7">7 วัน</option>
              <option value="15">15 วัน</option>
              <option value="30">30 วัน</option>
              <option value="60">60 วัน</option>
              <option value="90">90 วัน</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="fetchExpiringNumbers"
              class="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              ค้นหา
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-400" />
                </div>
                <div class="ml-3 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">หมดอายุแล้ว</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ expiredCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ClockIcon class="h-6 w-6 text-orange-400" />
                </div>
                <div class="ml-3 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">ใกล้หมดอายุ (7 วัน)</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ soonExpireCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <InformationCircleIcon class="h-6 w-6 text-blue-400" />
                </div>
                <div class="ml-3 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">รวมทั้งหมด</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ phoneNumbers.length }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expiring Numbers Table -->
        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              เบอร์ที่จะหมดอายุใน {{ days }} วัน ({{ expiryType === 'promotion' ? 'โปรโมชั่น' : 'ซิม' }})
            </h3>
          </div>
          <div class="border-t border-gray-200">
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
                    {{ expiryType === 'promotion' ? 'โปรโมชั่น' : 'วันหมดอายุซิม' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันหมดอายุ
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
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
                    {{ expiryType === 'promotion' ? (phoneNumber.promotion || '-') : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ formatDate(expiryType === 'promotion' ? phoneNumber.promotionEndDate : phoneNumber.simExpiryDate) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ getDaysUntilExpiry(expiryType === 'promotion' ? phoneNumber.promotionEndDate : phoneNumber.simExpiryDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getExpiryStatusBadge(expiryType === 'promotion' ? phoneNumber.promotionEndDate : phoneNumber.simExpiryDate)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ getExpiryStatusText(expiryType === 'promotion' ? phoneNumber.promotionEndDate : phoneNumber.simExpiryDate) }}
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
                      class="text-green-600 hover:text-green-900"
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
                <tr v-if="phoneNumbers.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบเบอร์ที่จะหมดอายุในช่วงเวลาที่กำหนด
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon, ClockIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

const config = useRuntimeConfig()
const router = useRouter()

const phoneNumbers = ref([])
const expiryType = ref('promotion')
const days = ref(30)

const expiredCount = computed(() => {
  return phoneNumbers.value.filter(phone => {
    const expiryDate = new Date(expiryType.value === 'promotion' ? phone.promotionEndDate : phone.simExpiryDate)
    return expiryDate < new Date()
  }).length
})

const soonExpireCount = computed(() => {
  const today = new Date()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  return phoneNumbers.value.filter(phone => {
    const expiryDate = new Date(expiryType.value === 'promotion' ? phone.promotionEndDate : phone.simExpiryDate)
    return expiryDate >= today && expiryDate <= weekFromNow
  }).length
})

const fetchExpiringNumbers = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/phone-numbers/expiring`, {
      params: {
        type: expiryType.value,
        days: days.value
      }
    })
    phoneNumbers.value = response.phoneNumbers || []
  } catch (error) {
    console.error('Failed to fetch expiring phone numbers:', error)
  }
}

const editPhoneNumber = (phoneNumber) => {
  router.push(`/phone-numbers/edit/${phoneNumber.id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH')
}

const getDaysUntilExpiry = (dateString) => {
  if (!dateString) return ''

  const expiryDate = new Date(dateString)
  const today = new Date()
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `หมดอายุแล้ว ${Math.abs(diffDays)} วัน`
  if (diffDays === 0) return 'หมดอายุวันนี้'
  if (diffDays === 1) return 'หมดอายุพรุ่งนี้'
  return `อีก ${diffDays} วัน`
}

const getExpiryStatusText = (dateString) => {
  if (!dateString) return 'ไม่ระบุ'

  const expiryDate = new Date(dateString)
  const today = new Date()
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'หมดอายุแล้ว'
  if (diffDays <= 7) return 'ใกล้หมดอายุ'
  if (diffDays <= 30) return 'เตือน'
  return 'ปกติ'
}

const getExpiryStatusBadge = (dateString) => {
  if (!dateString) return 'bg-gray-100 text-gray-800'

  const expiryDate = new Date(dateString)
  const today = new Date()
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'bg-red-100 text-red-800'
  if (diffDays <= 7) return 'bg-orange-100 text-orange-800'
  if (diffDays <= 30) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
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

onMounted(() => {
  fetchExpiringNumbers()
})

useHead({
  title: 'เบอร์ที่ใกล้หมดอายุ - ระบบบันทึกข้อมูลเบอร์มือถือ'
})
</script>