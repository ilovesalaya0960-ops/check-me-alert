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
        <form @submit.prevent="handleAddPhone" class="phone-form">
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
              <label>หมวดหมู่ใช้งาน</label>
              <input
                v-model="newPhone.usageCategory"
                type="text"
                placeholder="เช่น งาน, ส่วนตัว, ธุรกิจ"
              />
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
              <label>ค่าใช้จ่าย/เดือน (ยังไม่สามารถใช้งานได้)</label>
              <input
                type="number"
                placeholder="0"
                disabled
                value="0"
              />
            </div>
            <div class="form-group">
              <label>วันที่สมัครโปร</label>
              <input
                v-model="newPhone.packageStartDate"
                type="date"
                @change="calculatePackageExpiry"
              />
            </div>
            <div class="form-group" v-if="newPhone.packageStartDate">
              <label>วันที่โปรหมดอายุ (คำนวณอัตโนมัติ)</label>
              <input
                :value="getCalculatedExpiryDate(newPhone.packageStartDate)"
                type="date"
                readonly
                class="readonly-field"
              />
            </div>
            <div class="form-group">
              <label>วันที่ซิมหมดอายุ</label>
              <input
                v-model="newPhone.simExpiryDate"
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
          <div class="header-controls">
            <!-- Data Management Buttons -->
            <div class="data-management">
              <button @click="exportData" class="export-btn" title="ส่งออกข้อมูล">
                💾 Export
              </button>
              <label class="import-btn" title="นำเข้าข้อมูล">
                📁 Import
                <input
                  type="file"
                  accept=".json"
                  @change="importData"
                  style="display: none"
                />
              </label>
            </div>

            <!-- Filter Controls -->
            <div class="filter-controls">
              <select v-model="filterStatus" @change="filterPhones">
                <option value="all">ทุกสถานะ</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="expired">หมดอายุ</option>
                <option value="package-expiring">โปรใกล้หมดอายุ</option>
                <option value="expiring">ซิม/โปรใกล้หมดอายุ</option>
              </select>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาเบอร์..."
                @input="searchPhones"
              />
            </div>
          </div>
        </div>

        <div class="phone-table">
          <table>
            <thead>
              <tr>
                <th>เบอร์โทรศัพท์</th>
                <th>ค่าย</th>
                <th>หมวดหมู่ใช้งาน</th>
                <th>แพ็กเกจ</th>
                <th>ค่าใช้จ่าย/เดือน</th>
                <th>วันที่สมัครโปร</th>
                <th>วันที่โปรหมดอายุ</th>
                <th>วันที่ซิมหมดอายุ</th>
                <th>สถานะ</th>
                <th>หมายเหตุ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="phone in filteredPhones" :key="phone.id" class="phone-row">
                <td class="phone-number">
                  <strong>{{ phone.number }}</strong>
                </td>
                <td class="network">
                  <span class="network-badge" :class="phone.network.toLowerCase()">
                    {{ phone.network }}
                  </span>
                </td>
                <td class="usage-category">
                  <span v-if="phone.usageCategory" class="category-tag">
                    {{ phone.usageCategory }}
                  </span>
                  <span v-else class="no-category">-</span>
                </td>
                <td class="package">
                  {{ phone.package || '-' }}
                </td>
                <td class="cost">
                  <span class="no-cost">-</span>
                </td>
                <td class="package-start">
                  <span v-if="phone.packageStartDate">
                    {{ formatDate(phone.packageStartDate) }}
                  </span>
                  <span v-else class="no-date">-</span>
                </td>
                <td class="package-expiry">
                  <span v-if="phone.packageExpiryDate" :class="getPackageExpiryClass(phone.packageExpiryDate, phone.status)">
                    {{ formatDate(phone.packageExpiryDate) }}
                  </span>
                  <span v-else class="no-date">-</span>
                </td>
                <td class="sim-expiry">
                  <span :class="getSimExpiryClass(phone.simExpiryDate, phone.status)">
                    {{ formatDate(phone.simExpiryDate) }}
                  </span>
                </td>
                <td class="status">
                  <span :class="['status-badge', phone.status]">
                    {{ getStatusText(phone.status) }}
                  </span>
                </td>
                <td class="notes">
                  <span v-if="phone.notes" class="note-text" :title="phone.notes">
                    {{ phone.notes.length > 20 ? phone.notes.substring(0, 20) + '...' : phone.notes }}
                  </span>
                  <span v-else class="no-notes">-</span>
                </td>
                <td class="actions">
                  <button @click="editPhone(phone)" class="action-btn edit-btn" title="แก้ไข">
                    ✏️
                  </button>
                  <button @click="handleDeletePhone(phone.id)" class="action-btn delete-btn" title="ลบ">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredPhones.length === 0" class="empty-state">
          <div class="empty-icon">📱</div>
          <h3>ไม่มีเบอร์ที่ตรงกับเงื่อนไข</h3>
          <p>ลองเปลี่ยนตัวกรองหรือเพิ่มเบอร์ใหม่</p>
        </div>
      </section>
    </main>

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>✏️ แก้ไขข้อมูลเบอร์</h2>
          <button @click="cancelEdit" class="close-button">✕</button>
        </div>
        <form @submit.prevent="handleUpdatePhone" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input
                v-model="editingPhone.number"
                type="text"
                placeholder="081-234-5678"
                required
              />
            </div>
            <div class="form-group">
              <label>ค่ายเครือข่าย</label>
              <select v-model="editingPhone.network" required>
                <option value="">เลือกค่าย</option>
                <option value="AIS">AIS</option>
                <option value="DTAC">DTAC</option>
                <option value="TRUE">TRUE</option>
                <option value="NT">NT</option>
              </select>
            </div>
            <div class="form-group">
              <label>หมวดหมู่ใช้งาน</label>
              <input
                v-model="editingPhone.usageCategory"
                type="text"
                placeholder="เช่น งาน, ส่วนตัว, ธุรกิจ"
              />
            </div>
            <div class="form-group">
              <label>แพ็กเกจ</label>
              <input
                v-model="editingPhone.package"
                type="text"
                placeholder="เน็ตไม่อั้น 30 วัน"
              />
            </div>
            <div class="form-group">
              <label>ค่าใช้จ่าย/เดือน (ยังไม่สามารถใช้งานได้)</label>
              <input
                type="number"
                placeholder="0"
                disabled
                value="0"
              />
            </div>
            <div class="form-group">
              <label>วันที่สมัครโปร</label>
              <input
                v-model="editingPhone.packageStartDate"
                type="date"
                @change="calculateEditPackageExpiry"
              />
            </div>
            <div class="form-group" v-if="editingPhone.packageStartDate">
              <label>วันที่โปรหมดอายุ (คำนวณอัตโนมัติ)</label>
              <input
                :value="getCalculatedExpiryDate(editingPhone.packageStartDate)"
                type="date"
                readonly
                class="readonly-field"
              />
            </div>
            <div class="form-group">
              <label>วันที่ซิมหมดอายุ</label>
              <input
                v-model="editingPhone.simExpiryDate"
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label>สถานะ</label>
              <select v-model="editingPhone.status">
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="expired">หมดอายุ</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>หมายเหตุ</label>
              <textarea
                v-model="editingPhone.notes"
                placeholder="หมายเหตุเพิ่มเติม"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="cancelEdit" class="cancel-button">
              ยกเลิก
            </button>
            <button type="submit" class="update-button">
              อัพเดท
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Use Supabase for data management
const { phones, loading, error, fetchPhones, addPhone, updatePhone, deletePhone, searchPhones } = usePhones()

const newPhone = ref({
  number: '',
  network: '',
  usageCategory: '',
  package: '',
  // monthlyCost: '', // Temporarily disabled
  packageStartDate: '',
  simExpiryDate: '',
  status: 'active',
  notes: ''
})
const filterStatus = ref('all')
const searchQuery = ref('')

// Edit modal state
const isEditModalOpen = ref(false)
const editingPhone = ref(null)

// Load initial data
onMounted(async () => {
  await fetchPhones()

  // Check for filter query parameter
  const route = useRoute()
  if (route.query.filter) {
    handleQueryFilter(route.query.filter)
  }
})

const handleQueryFilter = (filter) => {
  switch (filter) {
    case 'package-expiring':
      filterStatus.value = 'package-expiring'
      break
    case 'expiring':
      filterStatus.value = 'expiring'
      break
    default:
      filterStatus.value = filter
  }
}

const getCalculatedExpiryDate = (startDate) => {
  if (!startDate) return ''
  const start = new Date(startDate)
  const expiry = new Date(start)
  expiry.setDate(start.getDate() + 30)
  return expiry.toISOString().split('T')[0]
}

const calculatePackageExpiry = () => {
  // This will trigger reactivity for the readonly field display
}

const calculateEditPackageExpiry = () => {
  // This will trigger reactivity for the readonly field display
}

// Export Data Function
const exportData = () => {
  const dataToExport = {
    phones: phones.value,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }

  const dataStr = JSON.stringify(dataToExport, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `phone-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  alert('ส่งออกข้อมูลเรียบร้อยแล้ว!')
}

// Import Data Function
const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result)

      // Validate imported data structure
      if (importedData.phones && Array.isArray(importedData.phones)) {
        // Confirm import
        const confirmImport = confirm(
          `คุณต้องการนำเข้าข้อมูล ${importedData.phones.length} เบอร์หรือไม่?\n` +
          `ข้อมูลปัจจุบันจะถูกเขียนทับ`
        )

        if (confirmImport) {
          phones.value = importedData.phones.map(phone => ({
            ...phone,
            // Ensure required fields exist
            id: phone.id || Date.now() + Math.random(),
            packageExpiryDate: phone.packageStartDate ? getCalculatedExpiryDate(phone.packageStartDate) : phone.packageExpiryDate
          }))

          savePhones()
          alert('นำเข้าข้อมูลเรียบร้อยแล้ว!')

          // Reset file input
          event.target.value = ''
        }
      } else {
        alert('ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ที่ส่งออกจากระบบ')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + error.message)
    }
  }
  reader.readAsText(file)
}

const handleAddPhone = async () => {
  console.log('📝 Form data:', newPhone.value)

  if (!newPhone.value.number || !newPhone.value.network || !newPhone.value.simExpiryDate) {
    alert('กรุณากรอกข้อมูลที่จำเป็น')
    return
  }

  console.log('✅ Form validation passed')

  try {
    console.log('🔄 Calling addPhone...')
    const result = await addPhone(newPhone.value)
    console.log('✅ addPhone result:', result)

    // Reset form
    newPhone.value = {
      number: '',
      network: '',
      usageCategory: '',
      package: '',
      // monthlyCost: '', // Temporarily disabled
      packageStartDate: '',
      simExpiryDate: '',
      status: 'active',
      notes: ''
    }

    alert('เพิ่มเบอร์สำเร็จ!')
  } catch (err) {
    console.error('❌ addPhone error:', err)
    alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถเพิ่มเบอร์ได้'))
  }
}

const editPhone = (phone) => {
  editingPhone.value = { ...phone }
  isEditModalOpen.value = true
}

const handleUpdatePhone = async () => {
  if (!editingPhone.value.number || !editingPhone.value.network || !editingPhone.value.simExpiryDate) {
    alert('กรุณากรอกข้อมูลที่จำเป็น')
    return
  }

  try {
    await updatePhone(editingPhone.value.id, editingPhone.value)
    isEditModalOpen.value = false
    editingPhone.value = null
    alert('อัพเดทข้อมูลสำเร็จ!')
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถอัปเดตเบอร์ได้'))
  }
}

const cancelEdit = () => {
  isEditModalOpen.value = false
  editingPhone.value = null
}

const handleDeletePhone = async (id) => {
  if (confirm('คุณต้องการลบเบอร์นี้หรือไม่?')) {
    try {
      await deletePhone(id)
      alert('ลบเบอร์สำเร็จ!')
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถลบเบอร์ได้'))
    }
  }
}

const filteredPhones = computed(() => {
  let result = phones.value

  // Filter by status
  if (filterStatus.value !== 'all') {
    if (filterStatus.value === 'package-expiring') {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      result = result.filter(phone => {
        // Check only package expiry
        const packageExpiry = phone.packageExpiryDate ? new Date(phone.packageExpiryDate) : null
        return packageExpiry && packageExpiry <= nextWeek && packageExpiry >= today && phone.status === 'active'
      })
    } else if (filterStatus.value === 'expiring') {
      const today = new Date()
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      result = result.filter(phone => {
        // Check both package expiry and SIM expiry
        const packageExpiry = phone.packageExpiryDate ? new Date(phone.packageExpiryDate) : null
        const simExpiry = phone.simExpiryDate ? new Date(phone.simExpiryDate) : null

        const packageExpiring = packageExpiry && packageExpiry <= nextMonth && packageExpiry >= today
        const simExpiring = simExpiry && simExpiry <= nextMonth && simExpiry >= today

        return (packageExpiring || simExpiring) && phone.status === 'active'
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

const getPackageExpiryClass = (expiryDate, status) => {
  if (!expiryDate || status !== 'active') return ''

  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired-date'
  if (diffDays <= 3) return 'expiring-soon'
  if (diffDays <= 7) return 'expiring-month'
  return 'normal-date'
}

const getSimExpiryClass = (expiryDate, status) => {
  if (!expiryDate) return ''

  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired-date'
  if (diffDays <= 30) return 'expiring-soon'
  if (diffDays <= 90) return 'expiring-month'
  return 'normal-date'
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

.readonly-field {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.data-management {
  display: flex;
  gap: 10px;
}

.export-btn, .import-btn {
  padding: 8px 16px;
  border: 2px solid #3498db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.export-btn {
  background: #3498db;
  color: white;
}

.export-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
}

.import-btn {
  background: white;
  color: #3498db;
}

.import-btn:hover {
  background: #3498db;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
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

.phone-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.phone-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.phone-table th {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  padding: 15px 12px;
  text-align: left;
  border-bottom: 2px solid #ecf0f1;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.phone-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f2f6;
  vertical-align: middle;
}

.phone-row {
  transition: all 0.2s ease;
}

.phone-row:hover {
  background: #f8f9fa;
}

.phone-row:last-child td {
  border-bottom: none;
}

.phone-number strong {
  color: #2c3e50;
  font-size: 15px;
}

.network-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.network-badge.ais {
  background: #e8f5e8;
  color: #27ae60;
}

.network-badge.dtac {
  background: #e3f2fd;
  color: #2196f3;
}

.network-badge.true {
  background: #ffebee;
  color: #f44336;
}

.network-badge.nt {
  background: #fff3e0;
  color: #ff9800;
}

.category-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.no-category {
  color: #bdc3c7;
  font-style: italic;
}

.usage-category {
  max-width: 120px;
}

.package {
  color: #5a6c7d;
  max-width: 150px;
}

.cost-amount {
  color: #27ae60;
  font-weight: 600;
}

.no-cost, .no-notes, .no-date {
  color: #bdc3c7;
  font-style: italic;
}

.package-start, .package-expiry, .sim-expiry {
  font-weight: 500;
  font-size: 13px;
}

.expiry {
  font-weight: 500;
}

.normal-date {
  color: #2c3e50;
}

.expiring-month {
  color: #f39c12;
}

.expiring-soon {
  color: #e67e22;
  font-weight: 600;
}

.expired-date {
  color: #e74c3c;
  font-weight: 600;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.note-text {
  color: #5a6c7d;
  cursor: help;
}

.actions {
  white-space: nowrap;
}

.action-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 8px;
  margin: 0 2px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.edit-btn {
  border-color: #f39c12;
  color: #f39c12;
}

.edit-btn:hover {
  background: #f39c12;
  color: white;
}

.delete-btn {
  border-color: #e74c3c;
  color: #e74c3c;
}

.delete-btn:hover {
  background: #e74c3c;
  color: white;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px 15px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.3em;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #7f8c8d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f8f9fa;
  color: #e74c3c;
}

.edit-form {
  padding: 20px 30px 30px;
}

.edit-form .form-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  margin-bottom: 25px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  border-top: 1px solid #ecf0f1;
  padding-top: 20px;
}

.cancel-button, .update-button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: #95a5a6;
  color: white;
}

.cancel-button:hover {
  background: #7f8c8d;
}

.update-button {
  background: #27ae60;
  color: white;
}

.update-button:hover {
  background: #219a52;
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(39, 174, 96, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .phone-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .phone-table table {
    min-width: 1300px;
  }

  .phone-table th,
  .phone-table td {
    padding: 8px 6px;
    font-size: 12px;
  }

  .phone-table th {
    font-size: 11px;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 20px 20px 15px;
  }

  .edit-form {
    padding: 15px 20px 25px;
  }

  .edit-form .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .cancel-button, .update-button {
    width: 100%;
  }
}
</style>