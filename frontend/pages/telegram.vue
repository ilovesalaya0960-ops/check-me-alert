<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">ตั้งค่า Telegram แจ้งเตือน</h1>
          <p class="mt-2 text-sm text-gray-700">
            กำหนดค่า Telegram Bot สำหรับแจ้งเตือนเบอร์ที่ใกล้หมดอายุ
          </p>
        </div>

        <!-- Step 1: Bot Setup -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">🤖 ขั้นตอนที่ 1: สร้าง Telegram Bot</h3>
          </div>
          <div class="p-6">
            <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h4 class="font-medium text-blue-900 mb-2">วิธีสร้าง Bot:</h4>
              <ol class="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>เปิด Telegram หา <strong>@BotFather</strong></li>
                <li>พิมพ์: <code>/newbot</code></li>
                <li>ตั้งชื่อ Bot: <strong>Phone Management Bot</strong></li>
                <li>ตั้ง Username: <strong>PhoneManagementBot_[เลขสุ่ม]</strong></li>
                <li>เก็บ <strong>Bot Token</strong> ที่ได้มา</li>
              </ol>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
              <div class="flex">
                <input
                  v-model="botToken"
                  type="password"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyZ"
                  class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  @click="testBot"
                  :disabled="!botToken || testingBot"
                  class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <span v-if="testingBot">กำลังทดสอบ...</span>
                  <span v-else>ทดสอบ Bot</span>
                </button>
              </div>
              <div v-if="botInfo" class="mt-2 text-sm text-green-600">
                ✅ Bot: {{ botInfo.result?.first_name }} (@{{ botInfo.result?.username }})
              </div>
              <div v-if="botError" class="mt-2 text-sm text-red-600">
                ❌ {{ botError }}
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Group Setup -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">👥 ขั้นตอนที่ 2: เพิ่ม Bot เข้ากลุ่ม</h3>
          </div>
          <div class="p-6">
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <h4 class="font-medium text-yellow-900 mb-2">วิธีเพิ่ม Bot เข้ากลุ่ม:</h4>
              <ol class="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                <li>เข้าไปในกลุ่ม Telegram ที่ต้องการรับแจ้งเตือน</li>
                <li>คลิก <strong>Add Members</strong></li>
                <li>ค้นหา Bot ที่สร้างไว้</li>
                <li>เพิ่ม Bot เข้ากลุ่ม</li>
                <li>ส่งข้อความใด ๆ ในกลุ่ม</li>
                <li>คลิก <strong>"ดูกลุ่มที่พบ"</strong> ด้านล่าง</li>
              </ol>
            </div>

            <button
              @click="getChats"
              :disabled="!botToken || loadingChats"
              class="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <span v-if="loadingChats">กำลังค้นหา...</span>
              <span v-else>ดูกลุ่มที่พบ</span>
            </button>

            <div v-if="availableChats && Object.keys(availableChats).length > 0" class="space-y-2">
              <h4 class="font-medium text-gray-900">เลือกกลุ่มสำหรับแจ้งเตือน:</h4>
              <div v-for="(chat, chatId) in availableChats" :key="chatId" class="flex items-center">
                <input
                  :id="`chat-${chatId}`"
                  v-model="selectedChatId"
                  :value="chatId"
                  type="radio"
                  name="chat"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label :for="`chat-${chatId}`" class="ml-3 block text-sm font-medium text-gray-700">
                  {{ chat.title || `Chat ${chatId}` }} ({{ chat.type }})
                  <span class="text-gray-500">- ID: {{ chatId }}</span>
                </label>
              </div>
            </div>

            <div v-if="chatsError" class="mt-2 text-sm text-red-600">
              ❌ {{ chatsError }}
            </div>
          </div>
        </div>

        <!-- Step 3: Test Notification -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">🧪 ขั้นตอนที่ 3: ทดสอบการแจ้งเตือน</h3>
          </div>
          <div class="p-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ข้อความทดสอบ</label>
              <textarea
                v-model="testMessage"
                rows="3"
                placeholder="ข้อความทดสอบ (เว้นว่างไว้เพื่อใช้ข้อความเริ่มต้น)"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              ></textarea>
            </div>

            <button
              @click="sendTestMessage"
              :disabled="!botToken || !selectedChatId || sendingTest"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <span v-if="sendingTest">กำลังส่ง...</span>
              <span v-else>ส่งข้อความทดสอบ</span>
            </button>

            <div v-if="testResult" class="mt-4 p-4 rounded-md" :class="testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
              {{ testResult.success ? '✅ ส่งข้อความสำเร็จ!' : '❌ ส่งข้อความไม่สำเร็จ' }}
            </div>
          </div>
        </div>

        <!-- Step 4: Save Settings -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">💾 ขั้นตอนที่ 4: บันทึกการตั้งค่า</h3>
          </div>
          <div class="p-6">
            <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <h4 class="font-medium text-green-900 mb-2">การตั้งค่าปัจจุบัน:</h4>
              <ul class="text-sm text-green-800 space-y-1">
                <li><strong>Bot Token:</strong> {{ botToken ? '••••••••••' : 'ยังไม่ตั้งค่า' }}</li>
                <li><strong>Chat ID:</strong> {{ selectedChatId || 'ยังไม่เลือก' }}</li>
                <li><strong>สถานะ:</strong> {{ getSetupStatus() }}</li>
              </ul>
            </div>

            <button
              @click="saveSettings"
              :disabled="!botToken || !selectedChatId || savingSettings"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <span v-if="savingSettings">กำลังบันทึก...</span>
              <span v-else>บันทึกการตั้งค่า</span>
            </button>

            <div v-if="saveResult" class="mt-4 p-4 rounded-md" :class="saveResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
              {{ saveResult.success ? '✅ บันทึกการตั้งค่าสำเร็จ!' : '❌ บันทึกการตั้งค่าไม่สำเร็จ' }}
            </div>
          </div>
        </div>

        <!-- Step 5: Send Notifications -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">🚨 ส่งการแจ้งเตือน</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                @click="sendExpiryNotifications"
                :disabled="!isConfigured || sendingNotification"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <span v-if="sendingNotification">กำลังส่ง...</span>
                <span v-else>แจ้งเตือนเบอร์ที่ใกล้หมดอายุ</span>
              </button>

              <button
                @click="toggleAutoNotification"
                :disabled="!isConfigured"
                :class="[
                  'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md transition-colors',
                  autoNotificationEnabled
                    ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
                  !isConfigured ? 'opacity-50 cursor-not-allowed' : ''
                ]"
              >
                {{ autoNotificationEnabled ? '🟢 แจ้งเตือนอัตโนมัติเปิดอยู่' : '⚪ เปิดแจ้งเตือนอัตโนมัติ' }}
              </button>
            </div>

            <div v-if="notificationResult" class="mt-4 p-4 rounded-md" :class="notificationResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
              <div v-if="notificationResult.success">
                <div v-if="notificationResult.message">
                  ✅ {{ notificationResult.message }}
                </div>
                <div v-else>
                  ✅ ส่งการแจ้งเตือนสำเร็จ!
                  <div v-if="notificationResult.count" class="mt-1">
                    พบเบอร์ที่ใกล้หมดอายุ: {{ notificationResult.count }} เบอร์
                  </div>
                </div>
              </div>
              <div v-else>
                <div v-if="notificationResult.message">
                  ❌ {{ notificationResult.message }}
                </div>
                <div v-else>
                  ❌ ส่งการแจ้งเตือนไม่สำเร็จ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// State
const botToken = ref('')
const selectedChatId = ref('')
const testMessage = ref('')

const botInfo = ref(null)
const botError = ref('')
const testingBot = ref(false)

const availableChats = ref({})
const chatsError = ref('')
const loadingChats = ref(false)

const testResult = ref(null)
const sendingTest = ref(false)

const saveResult = ref(null)
const savingSettings = ref(false)

const notificationResult = ref(null)
const sendingNotification = ref(false)

const autoNotificationEnabled = ref(false)

// Computed
const isConfigured = computed(() => {
  return botToken.value && selectedChatId.value
})

// Methods
const testBot = async () => {
  testingBot.value = true
  botError.value = ''
  botInfo.value = null

  try {
    console.log('Testing bot with token:', botToken.value)
    console.log('API URL:', `${config.public.apiBase}/telegram/bot-info`)

    const response = await $fetch(`${config.public.apiBase}/telegram/bot-info`, {
      method: 'GET',
      headers: {
        'TELEGRAM_BOT_TOKEN': botToken.value,
        'Content-Type': 'application/json'
      }
    })

    console.log('Bot response:', response)
    console.log('Response type:', typeof response)
    console.log('Response.ok:', response?.ok)

    if (response && response.ok === true) {
      botInfo.value = response
      console.log('Bot info set successfully')
    } else {
      console.log('Bot response failed:', response)
      botError.value = `API ตอบกลับ: ${JSON.stringify(response)}`
    }
  } catch (error) {
    console.error('Error testing bot:', error)
    botError.value = `เกิดข้อผิดพลาด: ${error.message}`
  } finally {
    testingBot.value = false
  }
}

const getChats = async () => {
  loadingChats.value = true
  chatsError.value = ''
  availableChats.value = {}

  try {
    const response = await $fetch(`${config.public.apiBase}/telegram/updates`, {
      headers: {
        'TELEGRAM_BOT_TOKEN': botToken.value
      }
    })

    if (response.ok && response.chats) {
      availableChats.value = response.chats
    } else {
      chatsError.value = 'ไม่พบกลุ่มใด ๆ กรุณาส่งข้อความในกลุ่มที่เพิ่ม Bot แล้วลองใหม่'
    }
  } catch (error) {
    chatsError.value = 'ไม่สามารถดึงข้อมูลกลุ่มได้'
  } finally {
    loadingChats.value = false
  }
}

const sendTestMessage = async () => {
  sendingTest.value = true
  testResult.value = null

  try {
    const response = await $fetch(`${config.public.apiBase}/telegram/test`, {
      method: 'POST',
      headers: {
        'TELEGRAM_BOT_TOKEN': botToken.value
      },
      body: {
        chatId: selectedChatId.value,
        message: testMessage.value
      }
    })

    testResult.value = response
  } catch (error) {
    testResult.value = { success: false }
  } finally {
    sendingTest.value = false
  }
}

const saveSettings = async () => {
  savingSettings.value = true
  saveResult.value = null

  try {
    // Save to environment variables or database
    // For now, just save to localStorage
    localStorage.setItem('telegram_bot_token', botToken.value)
    localStorage.setItem('telegram_chat_id', selectedChatId.value)

    saveResult.value = { success: true }
  } catch (error) {
    saveResult.value = { success: false }
  } finally {
    savingSettings.value = false
  }
}

const sendExpiryNotifications = async () => {
  sendingNotification.value = true
  notificationResult.value = null

  try {
    const response = await $fetch(`${config.public.apiBase}/telegram/notify-expiry`, {
      method: 'POST',
      headers: {
        'TELEGRAM_BOT_TOKEN': botToken.value,
        'TELEGRAM_CHAT_ID': selectedChatId.value
      }
    })

    notificationResult.value = response
  } catch (error) {
    notificationResult.value = { success: false }
  } finally {
    sendingNotification.value = false
  }
}

const getSetupStatus = () => {
  if (!botToken.value) return 'ยังไม่ตั้งค่า Bot Token'
  if (!selectedChatId.value) return 'ยังไม่เลือกกลุ่ม'
  return 'พร้อมใช้งาน'
}

const toggleAutoNotification = async () => {
  if (!isConfigured.value) return

  try {
    const newStatus = !autoNotificationEnabled.value

    // บันทึกค่าลง localStorage
    localStorage.setItem('auto_notification_enabled', newStatus.toString())
    autoNotificationEnabled.value = newStatus

    // อัปเดตค่าใน environment หรือ database (ในอนาคต)
    notificationResult.value = {
      success: true,
      message: newStatus
        ? 'เปิดการแจ้งเตือนอัตโนมัติแล้ว (ทุกวัน 00:10)'
        : 'ปิดการแจ้งเตือนอัตโนมัติแล้ว'
    }

  } catch (error) {
    notificationResult.value = {
      success: false,
      message: 'ไม่สามารถเปลี่ยนสถานะได้'
    }
  }
}

// Load saved settings on mount
onMounted(() => {
  const savedToken = localStorage.getItem('telegram_bot_token')
  const savedChatId = localStorage.getItem('telegram_chat_id')
  const savedAutoNotification = localStorage.getItem('auto_notification_enabled')

  if (savedToken) botToken.value = savedToken
  if (savedChatId) selectedChatId.value = savedChatId
  if (savedAutoNotification) autoNotificationEnabled.value = savedAutoNotification === 'true'
})

// Page meta
useHead({
  title: 'ตั้งค่า Telegram - ระบบจัดการเบอร์มือถือ'
})
</script>