<template>
  <div class="phone-management-system">
    <!-- Header -->
    <header class="header">
      <h1>📱 จัดการเบอร์มือถือ</h1>
      <p>Phone Number Management</p>
    </header>

    <!-- Navigation -->
    <nav class="navigation">
      <NuxtLink to="/" class="nav-link">🏠 หน้าหลัก</NuxtLink>
      <NuxtLink to="/phones" class="nav-link active">📱 จัดการเบอร์</NuxtLink>
      <NuxtLink to="/reports" class="nav-link">📊 รายงาน</NuxtLink>
      <NuxtLink to="/settings" class="nav-link">⚙️ ตั้งค่า</NuxtLink>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Add Phone Form -->
      <section class="add-phone-form">
        <h2>➕ เพิ่มเบอร์ใหม่</h2>
        <form @submit.prevent="addPhone" class="phone-form">
          <div class="form-grid">
            <div class="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input
                v-model="newPhone.number"
                type="text"
                placeholder="081-234-5678"
                required
              />
            </div>
            <div class="form-group">
              <label>ค่ายเครือข่าย</label>
              <select v-model="newPhone.network" required>
                <option value="">เลือกค่าย</option>
                <option value="AIS">AIS</option>
                <option value="DTAC">DTAC</option>
                <option value="TRUE">TRUE</option>
                <option value="NT">NT</option>
              </select>
            </div>
            <div class="form-group">
              <label>แพ็กเกจ</label>
              <input
                v-model="newPhone.package"
                type="text"
                placeholder="เน็ตไม่อั้น 30 วัน"
              />
            </div>
            <div class="form-group">
              <label>ค่าใช้จ่าย/เดือน</label>
              <input
                v-model="newPhone.monthlyCost"
                type="number"
                placeholder="199"
              />
            </div>
            <div class="form-group">
              <label>วันที่หมดอายุ</label>
              <input
                v-model="newPhone.expiryDate"
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label>สถานะ</label>
              <select v-model="newPhone.status">
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="expired">หมดอายุ</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>หมายเหตุ</label>
              <textarea
                v-model="newPhone.notes"
                placeholder="หมายเหตุเพิ่มเติม"
                rows="2"
              ></textarea>
            </div>
          </div>
          <button type="submit" class="submit-button">เพิ่มเบอร์</button>
        </form>
      </section>

      <!-- Phone List -->
      <section class="phone-list">
        <div class="list-header">
          <h2>📋 รายชื่อเบอร์ทั้งหมด</h2>
          <div class="filter-controls">
            <select v-model="filterStatus" @change="filterPhones">
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="expired">หมดอายุ</option>
              <option value="expiring">ใกล้หมดอายุ</option>
            </select>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาเบอร์..."
              @input="searchPhones"
            />
          </div>
        </div>

        <div class="phone-grid">
          <div v-for="phone in filteredPhones" :key="phone.id" class="phone-card">
            <div class="phone-header">
              <h3>{{ phone.number }}</h3>
              <span :class="['status-badge', phone.status]">{{ getStatusText(phone.status) }}</span>
            </div>
            <div class="phone-details">
              <div class="detail-item">
                <span class="label">ค่าย:</span>
                <span class="value">{{ phone.network }}</span>
              </div>
              <div class="detail-item">
                <span class="label">แพ็กเกจ:</span>
                <span class="value">{{ phone.package || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">ค่าใช้จ่าย:</span>
                <span class="value">{{ phone.monthlyCost ? phone.monthlyCost + ' ฿' : '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">หมดอายุ:</span>
                <span class="value">{{ formatDate(phone.expiryDate) }}</span>
              </div>
              <div v-if="phone.notes" class="detail-item notes">
                <span class="label">หมายเหตุ:</span>
                <span class="value">{{ phone.notes }}</span>
              </div>
            </div>
            <div class="phone-actions">
              <button @click="editPhone(phone)" class="edit-button">✏️ แก้ไข</button>
              <button @click="deletePhone(phone.id)" class="delete-button">🗑️ ลบ</button>
            </div>
          </div>
        </div>

        <div v-if="filteredPhones.length === 0" class="empty-state">
          <div class="empty-icon">📱</div>
          <h3>ไม่มีเบอร์ที่ตรงกับเงื่อนไข</h3>
          <p>ลองเปลี่ยนตัวกรองหรือเพิ่มเบอร์ใหม่</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const phones = ref([])
const newPhone = ref({
  number: '',
  network: '',
  package: '',
  monthlyCost: '',
  expiryDate: '',
  status: 'active',
  notes: ''
})
const filterStatus = ref('all')
const searchQuery = ref('')

// Load initial data
onMounted(() => {
  loadPhones()
})

const loadPhones = () => {
  const savedPhones = localStorage.getItem('phoneNumbers')
  if (savedPhones) {
    phones.value = JSON.parse(savedPhones)
  } else {
    // Sample data
    phones.value = [
      {
        id: 1,
        number: '081-234-5678',
        network: 'AIS',
        package: 'เน็ตไม่อั้น 30 วัน',
        monthlyCost: 199,
        expiryDate: '2024-02-15',
        status: 'active',
        notes: 'เบอร์หลัก'
      },
      {
        id: 2,
        number: '082-345-6789',
        network: 'DTAC',
        package: 'โทรไม่อั้น',
        monthlyCost: 299,
        expiryDate: '2024-01-28',
        status: 'active',
        notes: 'เบอร์สำรอง'
      },
      {
        id: 3,
        number: '083-456-7890',
        network: 'TRUE',
        package: 'เน็ต 10GB',
        monthlyCost: 159,
        expiryDate: '2024-01-20',
        status: 'expired',
        notes: 'ไม่ได้ใช้แล้ว'
      }
    ]
    savePhones()
  }
}

const savePhones = () => {
  localStorage.setItem('phoneNumbers', JSON.stringify(phones.value))
}

const addPhone = () => {
  if (!newPhone.value.number || !newPhone.value.network || !newPhone.value.expiryDate) {
    alert('กรุณากรอกข้อมูลที่จำเป็น')
    return
  }

  const phone = {
    id: Date.now(),
    ...newPhone.value,
    monthlyCost: newPhone.value.monthlyCost ? Number(newPhone.value.monthlyCost) : null
  }

  phones.value.push(phone)
  savePhones()

  // Reset form
  newPhone.value = {
    number: '',
    network: '',
    package: '',
    monthlyCost: '',
    expiryDate: '',
    status: 'active',
    notes: ''
  }

  alert('เพิ่มเบอร์สำเร็จ!')
}

const editPhone = (phone) => {
  const updatedPhone = { ...phone }
  // Simple edit - could be enhanced with a modal
  const newNumber = prompt('เบอร์โทรศัพท์:', phone.number)
  if (newNumber && newNumber !== phone.number) {
    updatedPhone.number = newNumber
    const index = phones.value.findIndex(p => p.id === phone.id)
    if (index !== -1) {
      phones.value[index] = updatedPhone
      savePhones()
    }
  }
}

const deletePhone = (id) => {
  if (confirm('คุณต้องการลบเบอร์นี้หรือไม่?')) {
    phones.value = phones.value.filter(phone => phone.id !== id)
    savePhones()
  }
}

const filteredPhones = computed(() => {
  let result = phones.value

  // Filter by status
  if (filterStatus.value !== 'all') {
    if (filterStatus.value === 'expiring') {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      result = result.filter(phone => {
        const expiryDate = new Date(phone.expiryDate)
        return expiryDate <= nextWeek && expiryDate >= today
      })
    } else {
      result = result.filter(phone => phone.status === filterStatus.value)
    }
  }

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(phone =>
      phone.number.toLowerCase().includes(query) ||
      phone.network.toLowerCase().includes(query) ||
      (phone.package && phone.package.toLowerCase().includes(query))
    )
  }

  return result
})

const getStatusText = (status) => {
  const statusMap = {
    active: 'ใช้งาน',
    inactive: 'ไม่ใช้งาน',
    expired: 'หมดอายุ'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: 'จัดการเบอร์มือถือ - ระบบจัดการเบอร์มือถือ'
})
</script>

<style scoped>
.phone-management-system {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1400px;
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
  border: 2px solid transparent;
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

.add-phone-form, .phone-list {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.add-phone-form h2, .phone-list h2 {
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.5em;
}

.phone-form {
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9em;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.submit-button {
  background: #27ae60;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: #219a52;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-controls {
  display: flex;
  gap: 15px;
}

.filter-controls select,
.filter-controls input {
  padding: 10px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
}

.phone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.phone-card {
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.phone-card:hover {
  border-color: #3498db;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
}

.phone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.phone-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2em;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d5f4e6;
  color: #27ae60;
}

.status-badge.inactive {
  background: #fef9e7;
  color: #f39c12;
}

.status-badge.expired {
  background: #fadbd8;
  color: #e74c3c;
}

.phone-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.detail-item.notes {
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.detail-item .label {
  font-weight: 500;
  color: #7f8c8d;
  font-size: 0.9em;
}

.detail-item .value {
  color: #2c3e50;
  font-weight: 500;
}

.phone-actions {
  display: flex;
  gap: 10px;
}

.edit-button, .delete-button {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button {
  background: #f39c12;
  color: white;
}

.edit-button:hover {
  background: #e67e22;
}

.delete-button {
  background: #e74c3c;
  color: white;
}

.delete-button:hover {
  background: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .phone-management-system {
    padding: 15px;
  }

  .navigation {
    flex-direction: column;
    text-align: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .phone-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    flex-direction: column;
  }
}
</style>