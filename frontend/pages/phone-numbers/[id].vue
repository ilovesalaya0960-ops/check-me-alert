<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
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
                <span class="text-gray-900">รายละเอียด</span>
              </li>
            </ol>
          </nav>
          <div class="mt-4 flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">รายละเอียดเบอร์มือถือ</h1>
            <div v-if="phoneNumber" class="flex space-x-3">
              <NuxtLink
                :to="`/phone-numbers/edit/${phoneNumber.id}`"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                แก้ไข
              </NuxtLink>
              <button
                @click="deletePhoneNumber"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Phone Number Details -->
        <div v-else-if="phoneNumber" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-xl font-bold text-blue-600">
                    {{ getCarrierEmoji(phoneNumber.carrier) }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-2xl leading-6 font-medium text-gray-900">{{ phoneNumber.phoneNumber }}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ phoneNumber.category }}</p>
              </div>
              <div class="ml-auto">
                <span :class="getStatusClass()" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText() }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <dl>
              <!-- Carrier -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">ค่าย</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span class="inline-flex items-center">
                    {{ getCarrierName(phoneNumber.carrier) }}
                    <span class="ml-2">{{ getCarrierEmoji(phoneNumber.carrier) }}</span>
                  </span>
                </dd>
              </div>

              <!-- Category -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">หมวดหมู่</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ phoneNumber.category }}</dd>
              </div>

              <!-- Promotion -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">โปรโมชั่น</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ phoneNumber.promotion || 'ไม่ระบุ' }}
                </dd>
              </div>

              <!-- Promotion Period -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">ระยะเวลาโปร</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div v-if="phoneNumber.promotionStartDate && phoneNumber.promotionEndDate">
                    {{ formatDate(phoneNumber.promotionStartDate) }} - {{ formatDate(phoneNumber.promotionEndDate) }}
                    <div class="mt-1">
                      <span :class="getExpiryStatusClass(phoneNumber.promotionEndDate)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getExpiryStatus(phoneNumber.promotionEndDate) }}
                      </span>
                    </div>
                  </div>
                  <span v-else class="text-gray-400">ไม่ระบุ</span>
                </dd>
              </div>

              <!-- SIM Expiry -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">วันหมดอายุซิม</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div v-if="phoneNumber.simExpiryDate">
                    {{ formatDate(phoneNumber.simExpiryDate) }}
                    <div class="mt-1">
                      <span :class="getExpiryStatusClass(phoneNumber.simExpiryDate)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ getExpiryStatus(phoneNumber.simExpiryDate) }}
                      </span>
                    </div>
                  </div>
                  <span v-else class="text-gray-400">ไม่ระบุ</span>
                </dd>
              </div>

              <!-- Notes -->
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">หมายเหตุ</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ phoneNumber.notes || 'ไม่มี' }}
                </dd>
              </div>

              <!-- Created/Updated -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">ข้อมูลระบบ</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div>สร้างเมื่อ: {{ formatDateTime(phoneNumber.createdAt) }}</div>
                  <div>แก้ไขล่าสุด: {{ formatDateTime(phoneNumber.updatedAt) }}</div>
                </dd>
              </div>
            </dl>
          </div>
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

// Fetch phone number data
const fetchPhoneNumber = async () => {
  try {
    loading.value = true
    const response = await $fetch(`${config.public.apiBase}/phone-numbers/${route.params.id}`)
    phoneNumber.value = response
  } catch (err) {
    console.error('Failed to fetch phone number:', err)
  } finally {
    loading.value = false
  }
}

// Delete phone number
const deletePhoneNumber = async () => {
  if (confirm('คุณต้องการลบเบอร์นี้หรือไม่?')) {
    try {
      await $fetch(`${config.public.apiBase}/phone-numbers/${route.params.id}`, {
        method: 'DELETE'
      })
      await router.push('/phone-numbers')
    } catch (err) {
      console.error('Failed to delete phone number:', err)
      alert('ไม่สามารถลบเบอร์ได้')
    }
  }
}

// Helper functions
const getCarrierName = (carrier) => {
  const names = {
    ais: 'AIS',
    dtac: 'DTAC',
    true: 'TRUE'
  }
  return names[carrier] || carrier
}

const getCarrierEmoji = (carrier) => {
  const emojis = {
    ais: '🟢',
    dtac: '🔵',
    true: '🔴'
  }
  return emojis[carrier] || '📱'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('th-TH')
}

const getExpiryStatus = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'หมดอายุแล้ว'
  if (diffDays <= 7) return `เหลือ ${diffDays} วัน`
  if (diffDays <= 30) return `เหลือ ${diffDays} วัน`
  return 'ยังไม่หมดอายุ'
}

const getExpiryStatusClass = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'bg-red-100 text-red-800'
  if (diffDays <= 7) return 'bg-red-100 text-red-800'
  if (diffDays <= 30) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStatusText = () => {
  if (!phoneNumber.value) return ''

  const now = new Date()
  const promoEnd = phoneNumber.value.promotionEndDate ? new Date(phoneNumber.value.promotionEndDate) : null
  const simEnd = phoneNumber.value.simExpiryDate ? new Date(phoneNumber.value.simExpiryDate) : null

  if ((promoEnd && promoEnd < now) || (simEnd && simEnd < now)) {
    return 'หมดอายุ'
  }

  return 'ใช้งานได้'
}

const getStatusClass = () => {
  const status = getStatusText()
  return status === 'หมดอายุ'
    ? 'bg-red-100 text-red-800'
    : 'bg-green-100 text-green-800'
}

// Load data on mount
onMounted(() => {
  fetchPhoneNumber()
})

// Page meta
useHead({
  title: 'รายละเอียดเบอร์มือถือ - ระบบจัดการเบอร์มือถือ'
})
</script>