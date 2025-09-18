<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">ตั้งค่า Telegram Bot</h1>
          <p class="mt-2 text-sm text-gray-700">
            กำหนดค่าการแจ้งเตือนผ่าน Telegram สำหรับเบอร์ที่จะหมดอายุ
          </p>
        </div>

        <!-- Settings Form -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">การตั้งค่า Telegram</h2>
          </div>

          <form @submit.prevent="saveSettings" class="p-6 space-y-6">
            <!-- Enable/Disable -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">เปิดใช้งาน Telegram Bot</h3>
                <p class="text-sm text-gray-500">เปิด/ปิดการแจ้งเตือนผ่าน Telegram</p>
              </div>
              <div class="ml-4">
                <button
                  type="button"
                  @click="settings.isEnabled = !settings.isEnabled"
                  :class="[
                    settings.isEnabled ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  ]"
                >
                  <span
                    :class="[
                      settings.isEnabled ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out'
                    ]"
                  />
                </button>
              </div>
            </div>

            <div v-if="settings.isEnabled" class="space-y-6">
              <!-- Bot Token -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Bot Token *</label>
                <div class="mt-1 relative">
                  <input
                    v-model="settings.botToken"
                    :type="showBotToken ? 'text' : 'password'"
                    required
                    placeholder="1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    @click="showBotToken = !showBotToken"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <EyeIcon v-if="!showBotToken" class="h-5 w-5 text-gray-400" />
                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  สร้าง Bot ใหม่ได้ที่ <a href="https://t.me/BotFather" target="_blank" class="text-blue-600 hover:text-blue-800">@BotFather</a>
                </p>
              </div>

              <!-- Chat ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Chat ID *</label>
                <input
                  v-model="settings.chatId"
                  type="text"
                  required
                  placeholder="-1001234567890 หรือ 123456789"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p class="mt-1 text-xs text-gray-500">
                  หา Chat ID ได้ที่ <a href="https://t.me/userinfobot" target="_blank" class="text-blue-600 hover:text-blue-800">@userinfobot</a>
                  (สำหรับ private chat) หรือเพิ่มบอทเข้ากลุ่มแล้วใช้ <a href="https://t.me/getidsbot" target="_blank" class="text-blue-600 hover:text-blue-800">@getidsbot</a>
                </p>
              </div>

              <!-- Test Connection -->
              <div class="flex items-center space-x-4">
                <button
                  type="button"
                  @click="testConnection"
                  :disabled="testing || !settings.botToken || !settings.chatId"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon v-if="!testing" class="h-4 w-4 mr-2" />
                  <ArrowPathIcon v-else class="h-4 w-4 mr-2 animate-spin" />
                  {{ testing ? 'กำลังทดสอب...' : 'ทดสอบการเชื่อมต่อ' }}
                </button>
                <span v-if="testResult" :class="testResult.success ? 'text-green-600' : 'text-red-600'" class="text-sm">
                  {{ testResult.message }}
                </span>
              </div>

              <!-- Notification Preferences -->
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">การตั้งค่าการแจ้งเตือน</h3>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <!-- Notify Promotion -->
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        v-model="settings.notifyPromotion"
                        type="checkbox"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label class="font-medium text-gray-700">แจ้งเตือนโปรโมชั่น</label>
                      <p class="text-gray-500">แจ้งเตือนเมื่อโปรโมชั่นจะหมดอายุ</p>
                    </div>
                  </div>

                  <!-- Notify SIM -->
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        v-model="settings.notifySim"
                        type="checkbox"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label class="font-medium text-gray-700">แจ้งเตือนซิม</label>
                      <p class="text-gray-500">แจ้งเตือนเมื่อซิมจะหมดอายุ</p>
                    </div>
                  </div>
                </div>

                <!-- Days Before Expiry -->
                <div class="mt-6">
                  <label class="block text-sm font-medium text-gray-700">แจ้งเตือนล่วงหน้า (วัน)</label>
                  <select
                    v-model="settings.daysBeforeExpiry"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option :value="1">1 วัน</option>
                    <option :value="3">3 วัน</option>
                    <option :value="7">7 วัน</option>
                    <option :value="14">14 วัน</option>
                    <option :value="30">30 วัน</option>
                  </select>
                </div>

                <!-- Daily Report -->
                <div class="mt-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-700">รายงานประจำวัน</h4>
                      <p class="text-sm text-gray-500">ส่งรายงานสรุปรายวัน</p>
                    </div>
                    <button
                      type="button"
                      @click="settings.dailyReport = !settings.dailyReport"
                      :class="[
                        settings.dailyReport ? 'bg-blue-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      ]"
                    >
                      <span
                        :class="[
                          settings.dailyReport ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out'
                        ]"
                      />
                    </button>
                  </div>

                  <div v-if="settings.dailyReport" class="mt-4">
                    <label class="block text-sm font-medium text-gray-700">เวลาส่งรายงาน</label>
                    <input
                      v-model="settings.dailyReportTime"
                      type="time"
                      class="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <NuxtLink
                to="/"
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ยกเลิก
              </NuxtLink>
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Actions -->
        <div v-if="settings.isEnabled && settings.botToken && settings.chatId" class="mt-8 bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">การทำงานด่วน</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                @click="sendDailyReport"
                :disabled="sendingReport"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <DocumentTextIcon class="h-4 w-4 mr-2" />
                {{ sendingReport ? 'กำลังส่ง...' : 'ส่งรายงานทันที' }}
              </button>

              <NuxtLink
                to="/settings/notification-logs"
                class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ClockIcon class="h-4 w-4 mr-2" />
                ดูประวัติการแจ้งเตือน
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const config = useRuntimeConfig()

const settings = ref({
  isEnabled: false,
  botToken: '',
  chatId: '',
  notifyPromotion: true,
  notifySim: true,
  daysBeforeExpiry: 7,
  dailyReport: false,
  dailyReportTime: '09:00'
})

const showBotToken = ref(false)
const saving = ref(false)
const testing = ref(false)
const sendingReport = ref(false)
const testResult = ref(null)

// Load settings on mount
const loadSettings = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/notifications/telegram/settings`)
    Object.assign(settings.value, response)
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

// Save settings
const saveSettings = async () => {
  saving.value = true
  try {
    await $fetch(`${config.public.apiBase}/notifications/telegram/settings`, {
      method: 'PUT',
      body: settings.value
    })

    testResult.value = { success: true, message: 'บันทึกการตั้งค่าสำเร็จ' }
    setTimeout(() => {
      testResult.value = null
    }, 3000)
  } catch (error) {
    console.error('Failed to save settings:', error)
    testResult.value = { success: false, message: 'เกิดข้อผิดพลาดในการบันทึก' }
  } finally {
    saving.value = false
  }
}

// Test connection
const testConnection = async () => {
  testing.value = true
  testResult.value = null

  try {
    await $fetch(`${config.public.apiBase}/notifications/telegram/test`, {
      method: 'POST'
    })
    testResult.value = { success: true, message: 'เชื่อมต่อสำเร็จ! ตรวจสอบข้อความใน Telegram' }
  } catch (error) {
    console.error('Test connection failed:', error)
    testResult.value = {
      success: false,
      message: error.data?.error || 'การเชื่อมต่อล้มเหลว'
    }
  } finally {
    testing.value = false
  }
}

// Send daily report
const sendDailyReport = async () => {
  sendingReport.value = true
  try {
    await $fetch(`${config.public.apiBase}/notifications/telegram/daily-report`, {
      method: 'POST'
    })
    testResult.value = { success: true, message: 'ส่งรายงานสำเร็จแล้ว' }
    setTimeout(() => {
      testResult.value = null
    }, 3000)
  } catch (error) {
    console.error('Failed to send daily report:', error)
    testResult.value = {
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งรายงาน'
    }
  } finally {
    sendingReport.value = false
  }
}

onMounted(() => {
  loadSettings()
})

useHead({
  title: 'ตั้งค่า Telegram Bot - ระบบบันทึกข้อมูลเบอร์มือถือ'
})
</script>