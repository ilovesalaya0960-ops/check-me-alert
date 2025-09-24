<template>
  <div class="phone-management-system">
    <!-- Header -->
    <header class="header">
      <h1>⚙️ ตั้งค่าระบบ</h1>
      <p>System Settings</p>
    </header>

    <!-- Navigation -->
    <nav class="navigation">
      <NuxtLink to="/" class="nav-link">🏠 หน้าหลัก</NuxtLink>
      <NuxtLink to="/phones" class="nav-link">📱 จัดการเบอร์</NuxtLink>
      <NuxtLink to="/reports" class="nav-link">📊 รายงาน</NuxtLink>
      <NuxtLink to="/settings" class="nav-link active">⚙️ ตั้งค่า</NuxtLink>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Notification Settings -->
      <section class="settings-section">
        <h2>🔔 การแจ้งเตือน</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <h3>แจ้งเตือนเบอร์หมดอายุ</h3>
              <p>แจ้งเตือนล่วงหน้าก่อนเบอร์หมดอายุ</p>
            </div>
            <label class="switch">
              <input v-model="settings.expiryNotifications" type="checkbox" @change="saveSettings">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h3>จำนวนวันแจ้งเตือนล่วงหน้า</h3>
              <p>แจ้งเตือนก่อนหมดอายุกี่วัน</p>
            </div>
            <select v-model="settings.notificationDays" @change="saveSettings">
              <option value="3">3 วัน</option>
              <option value="7">7 วัน</option>
              <option value="14">14 วัน</option>
              <option value="30">30 วัน</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Display Settings -->
      <section class="settings-section">
        <h2>🎨 การแสดงผล</h2>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <h3>ธีมสี</h3>
              <p>เลือกธีมสีของระบบ</p>
            </div>
            <select v-model="settings.theme" @change="saveSettings">
              <option value="default">ธีมเริ่มต้น</option>
              <option value="dark">ธีมมืด</option>
              <option value="blue">ธีมน้ำเงิน</option>
              <option value="green">ธีมเขียว</option>
            </select>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h3>จำนวนรายการต่อหน้า</h3>
              <p>กำหนดจำนวนเบอร์ที่แสดงในหน้าจัดการ</p>
            </div>
            <select v-model="settings.itemsPerPage" @change="saveSettings">
              <option value="10">10 รายการ</option>
              <option value="20">20 รายการ</option>
              <option value="50">50 รายการ</option>
              <option value="100">100 รายการ</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Data Management -->
      <section class="settings-section">
        <h2>💾 จัดการข้อมูล</h2>
        <div class="data-actions">
          <div class="action-card">
            <h3>🔄 สำรองข้อมูล</h3>
            <p>ส่งออกข้อมูลทั้งหมดเพื่อสำรอง</p>
            <button @click="backupData" class="action-button backup">
              สำรองข้อมูล
            </button>
          </div>
          <div class="action-card">
            <h3>📥 นำเข้าข้อมูล</h3>
            <p>นำเข้าข้อมูลจากไฟล์สำรอง</p>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="importData"
              style="display: none"
            >
            <button @click="$refs.fileInput.click()" class="action-button import">
              นำเข้าข้อมูล
            </button>
          </div>
          <div class="action-card danger">
            <h3>🗑️ ลบข้อมูลทั้งหมด</h3>
            <p>ลบข้อมูลเบอร์ทั้งหมดออกจากระบบ</p>
            <button @click="clearAllData" class="action-button danger">
              ลบข้อมูลทั้งหมด
            </button>
          </div>
        </div>
      </section>

      <!-- System Info -->
      <section class="settings-section">
        <h2>ℹ️ ข้อมูลระบบ</h2>
        <div class="system-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">เวอร์ชัน:</span>
              <span class="info-value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">จำนวนเบอร์ในระบบ:</span>
              <span class="info-value">{{ phoneCount }} เบอร์</span>
            </div>
            <div class="info-item">
              <span class="info-label">ขนาดข้อมูล:</span>
              <span class="info-value">{{ dataSize }} KB</span>
            </div>
            <div class="info-item">
              <span class="info-label">อัพเดทล่าสุด:</span>
              <span class="info-value">{{ lastUpdate }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Support -->
      <section class="settings-section">
        <h2>🆘 การสนับสนุน</h2>
        <div class="support-info">
          <div class="support-card">
            <h3>📞 ติดต่อสนับสนุน</h3>
            <p>หากพบปัญหาการใช้งาน สามารถติดต่อได้ที่:</p>
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <span>support@phonemanagement.com</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📱</span>
                <span>02-123-4567</span>
              </div>
            </div>
          </div>
          <div class="support-card">
            <h3>📚 คู่มือการใช้งาน</h3>
            <p>วิธีการใช้งานระบบและแก้ไขปัญหาเบื้องต้น</p>
            <button @click="openManual" class="support-button">
              เปิดคู่มือ
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const settings = ref({
  expiryNotifications: true,
  notificationDays: 7,
  theme: 'default',
  itemsPerPage: 20
})

const phones = ref([])

onMounted(() => {
  loadSettings()
  loadPhones()
})

const loadSettings = () => {
  const savedSettings = localStorage.getItem('phoneSettings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
  }
}

const saveSettings = () => {
  localStorage.setItem('phoneSettings', JSON.stringify(settings.value))

  // Apply theme
  applyTheme(settings.value.theme)

  // Show confirmation
  showNotification('บันทึกการตั้งค่าเรียบร้อย')
}

const applyTheme = (theme) => {
  const root = document.documentElement

  switch (theme) {
    case 'dark':
      root.style.setProperty('--bg-primary', '#2c3e50')
      root.style.setProperty('--bg-secondary', '#34495e')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#bdc3c7')
      break
    case 'blue':
      root.style.setProperty('--bg-primary', '#2980b9')
      root.style.setProperty('--bg-secondary', '#3498db')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#ecf0f1')
      break
    case 'green':
      root.style.setProperty('--bg-primary', '#27ae60')
      root.style.setProperty('--bg-secondary', '#2ecc71')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#ecf0f1')
      break
    default:
      root.style.removeProperty('--bg-primary')
      root.style.removeProperty('--bg-secondary')
      root.style.removeProperty('--text-primary')
      root.style.removeProperty('--text-secondary')
  }
}

const loadPhones = () => {
  const savedPhones = localStorage.getItem('phoneNumbers')
  if (savedPhones) {
    phones.value = JSON.parse(savedPhones)
  }
}

const phoneCount = computed(() => phones.value.length)

const dataSize = computed(() => {
  const data = localStorage.getItem('phoneNumbers') || '[]'
  return Math.round(new Blob([data]).size / 1024)
})

const lastUpdate = computed(() => {
  const phones = localStorage.getItem('phoneNumbers')
  if (phones) {
    const parsed = JSON.parse(phones)
    if (parsed.length > 0) {
      const lastPhone = parsed.reduce((latest, phone) =>
        new Date(phone.createdAt || 0) > new Date(latest.createdAt || 0) ? phone : latest
      )
      return new Date(lastPhone.createdAt || Date.now()).toLocaleDateString('th-TH')
    }
  }
  return 'ไม่มีข้อมูล'
})

const backupData = () => {
  const data = {
    phones: phones.value,
    settings: settings.value,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phone-management-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  showNotification('สำรองข้อมูลสำเร็จ')
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      if (data.phones) {
        localStorage.setItem('phoneNumbers', JSON.stringify(data.phones))
        phones.value = data.phones
      }

      if (data.settings) {
        localStorage.setItem('phoneSettings', JSON.stringify(data.settings))
        settings.value = { ...settings.value, ...data.settings }
        applyTheme(settings.value.theme)
      }

      showNotification('นำเข้าข้อมูลสำเร็จ')
    } catch (error) {
      showNotification('ไฟล์ข้อมูลไม่ถูกต้อง', 'error')
    }
  }
  reader.readAsText(file)
}

const clearAllData = () => {
  const confirmMessage = 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?\nการกระทำนี้ไม่สามารถยกเลิกได้'

  if (confirm(confirmMessage)) {
    const doubleConfirm = confirm('ยืนยันอีกครั้ง: ลบข้อมูลทั้งหมดหรือไม่?')
    if (doubleConfirm) {
      localStorage.removeItem('phoneNumbers')
      localStorage.removeItem('phoneSettings')
      phones.value = []
      settings.value = {
        expiryNotifications: true,
        notificationDays: 7,
        theme: 'default',
        itemsPerPage: 20
      }
      applyTheme('default')
      showNotification('ลบข้อมูลทั้งหมดเรียบร้อย')
    }
  }
}

const openManual = () => {
  showNotification('คู่มือการใช้งานจะเปิดในอนาคต')
}

const showNotification = (message, type = 'success') => {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

useHead({
  title: 'ตั้งค่าระบบ - ระบบจัดการเบอร์มือถือ'
})
</script>

<style scoped>
.phone-management-system {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.header h1 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

.header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.2em;
}

.navigation {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  padding: 12px 20px;
  border-radius: 25px;
  text-decoration: none;
  color: #34495e;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover, .nav-link.active {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.settings-section h2 {
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.5em;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  transition: border-color 0.3s ease;
}

.setting-item:hover {
  border-color: #3498db;
}

.setting-info h3 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1.1em;
}

.setting-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9em;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3498db;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

select {
  padding: 10px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #3498db;
}

.data-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-card {
  padding: 25px;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #3498db;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
}

.action-card.danger {
  border-color: #fadbd8;
  background: #fdf2f2;
}

.action-card.danger:hover {
  border-color: #e74c3c;
}

.action-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.action-card p {
  color: #7f8c8d;
  margin: 0 0 20px 0;
  font-size: 0.9em;
}

.action-button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.backup {
  background: #3498db;
  color: white;
}

.action-button.backup:hover {
  background: #2980b9;
}

.action-button.import {
  background: #27ae60;
  color: white;
}

.action-button.import:hover {
  background: #219a52;
}

.action-button.danger {
  background: #e74c3c;
  color: white;
}

.action-button.danger:hover {
  background: #c0392b;
}

.system-info, .support-info {
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #ecf0f1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ecf0f1;
}

.info-label {
  color: #7f8c8d;
  font-weight: 500;
}

.info-value {
  color: #2c3e50;
  font-weight: 600;
}

.support-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 0;
  background: none;
  border: none;
}

.support-card {
  padding: 25px;
  background: white;
  border-radius: 12px;
  border: 1px solid #ecf0f1;
}

.support-card h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.2em;
}

.support-card p {
  color: #7f8c8d;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
  font-weight: 500;
}

.contact-icon {
  font-size: 1.2em;
}

.support-button {
  background: #9b59b6;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.support-button:hover {
  background: #8e44ad;
}

@media (max-width: 768px) {
  .phone-management-system {
    padding: 15px;
  }

  .navigation {
    flex-direction: column;
    text-align: center;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .data-actions {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .support-info {
    grid-template-columns: 1fr;
  }
}

/* Notification animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>