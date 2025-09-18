<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <div class="mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">เพิ่มเบอร์มือถือใหม่</h1>
          <p class="mt-2 text-sm text-gray-700">กรอกข้อมูลเบอร์มือถือใหม่</p>
        </div>

        <div class="bg-white shadow rounded-lg">
          <form @submit.prevent="createPhoneNumber" class="space-y-6 p-6">
            <!-- Phone Number Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลเบอร์มือถือ</h3>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">เบอร์มือถือ *</label>
                  <input
                    v-model="form.phoneNumber"
                    type="text"
                    required
                    placeholder="0XX-XXX-XXXX"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">ค่าย *</label>
                  <select
                    v-model="form.carrier"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">เลือกค่าย</option>
                    <option value="ais">AIS</option>
                    <option value="dtac">DTAC</option>
                    <option value="true">TRUE</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">หมวดหมู่ *</label>
                  <input
                    v-model="form.category"
                    type="text"
                    required
                    placeholder="เช่น ส่วนตัว, งาน, ลูกค้า"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">โปรโมชั่น</label>
                  <input
                    v-model="form.promotion"
                    type="text"
                    placeholder="ชื่อโปรโมชั่นที่สมัคร"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Date Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลวันที่</h3>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">วันสมัครโปร</label>
                  <input
                    v-model="form.promotionStartDate"
                    type="date"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">วันโปรหมดอายุ</label>
                  <input
                    v-model="form.promotionEndDate"
                    type="date"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">วันหมดอายุซิม</label>
                  <input
                    v-model="form.simExpiryDate"
                    type="date"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700">หมายเหตุ</label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="หมายเหตุเพิ่มเติม"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end space-x-3">
              <NuxtLink
                to="/phone-numbers"
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </NuxtLink>
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const router = useRouter()

const submitting = ref(false)
const form = ref({
  phoneNumber: '',
  carrier: '',
  category: '',
  promotion: '',
  promotionStartDate: '',
  promotionEndDate: '',
  simExpiryDate: '',
  notes: ''
})

const createPhoneNumber = async () => {
  submitting.value = true

  try {
    const payload = { ...form.value }

    // Convert date strings to Date objects if they exist
    if (payload.promotionStartDate) {
      payload.promotionStartDate = new Date(payload.promotionStartDate).toISOString()
    }
    if (payload.promotionEndDate) {
      payload.promotionEndDate = new Date(payload.promotionEndDate).toISOString()
    }
    if (payload.simExpiryDate) {
      payload.simExpiryDate = new Date(payload.simExpiryDate).toISOString()
    }

    await $fetch(`${config.public.apiBase}/phone-numbers`, {
      method: 'POST',
      body: payload
    })

    router.push('/phone-numbers')
  } catch (error) {
    console.error('Failed to create phone number:', error)
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'เพิ่มเบอร์มือถือใหม่ - ระบบบันทึกข้อมูลเบอร์มือถือ'
})
</script>