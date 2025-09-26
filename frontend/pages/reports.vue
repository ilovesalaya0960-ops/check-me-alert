<template>
  <div class="phone-management-system">
    <!-- Header -->
    <header class="header">
      <h1>📊 รายงานและสถิติ</h1>
      <p>Reports & Analytics</p>
    </header>

    <!-- Navigation -->
    <nav class="navigation">
      <NuxtLink to="/" class="nav-link">🏠 หน้าหลัก</NuxtLink>
      <NuxtLink to="/phones" class="nav-link">📱 จัดการเบอร์</NuxtLink>
      <NuxtLink to="/reports" class="nav-link active">📊 รายงาน</NuxtLink>
      <NuxtLink to="/settings" class="nav-link">⚙️ ตั้งค่า</NuxtLink>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Summary Cards -->
      <section class="summary-cards">
        <div class="card">
          <div class="card-icon">📱</div>
          <div class="card-content">
            <h3>{{ totalPhones }}</h3>
            <p>เบอร์ทั้งหมด</p>
          </div>
        </div>
        <div class="card">
          <div class="card-icon">🟢</div>
          <div class="card-content">
            <h3>{{ activePhones }}</h3>
            <p>เบอร์ที่ใช้งาน</p>
          </div>
        </div>
        <div class="card">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <h3>{{ expiringPhones }}</h3>
            <p>ใกล้หมดอายุ (7 วัน)</p>
          </div>
        </div>
        <div class="card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>{{ totalMonthlyCost }} ฿</h3>
            <p>ค่าใช้จ่ายรวม/เดือน</p>
          </div>
        </div>
      </section>

      <!-- Network Distribution -->
      <section class="chart-section">
        <h2>📈 การกระจายตามค่ายเครือข่าย</h2>
        <div class="network-chart">
          <div v-for="network in networkStats" :key="network.name" class="network-bar">
            <div class="network-info">
              <span class="network-name">{{ network.name }}</span>
              <span class="network-count">{{ network.count }} เบอร์</span>
            </div>
            <div class="bar-container">
              <div
                class="bar"
                :style="{ width: (network.count / totalPhones) * 100 + '%' }"
                :class="network.name.toLowerCase()"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Status Distribution -->
      <section class="chart-section">
        <h2>📊 การกระจายตามสถานะ</h2>
        <div class="status-chart">
          <div v-for="status in statusStats" :key="status.name" class="status-item">
            <div class="status-circle" :class="status.class">
              <span class="status-percentage">{{ Math.round((status.count / totalPhones) * 100) }}%</span>
            </div>
            <div class="status-info">
              <h4>{{ status.label }}</h4>
              <p>{{ status.count }} เบอร์</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Cost Analysis -->
      <section class="chart-section">
        <h2>💸 การวิเคราะห์ค่าใช้จ่าย</h2>
        <div class="cost-analysis">
          <div class="cost-breakdown">
            <h3>แยกตามค่าย</h3>
            <div v-for="network in networkCosts" :key="network.name" class="cost-item">
              <div class="cost-header">
                <span class="network-name">{{ network.name }}</span>
                <span class="cost-amount">{{ network.cost }} ฿/เดือน</span>
              </div>
              <div class="cost-bar">
                <div
                  class="cost-fill"
                  :style="{ width: (network.cost / totalMonthlyCost) * 100 + '%' }"
                  :class="network.name.toLowerCase()"
                ></div>
              </div>
            </div>
          </div>
          <div class="average-cost">
            <h3>ค่าเฉลี่ย</h3>
            <div class="avg-card">
              <div class="avg-number">{{ averageCost }} ฿</div>
              <p>ต่อเบอร์ต่อเดือน</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Expiring Phones Alert -->
      <section v-if="expiringPhonesList.length > 0" class="alert-section">
        <h2>🚨 เบอร์ที่ใกล้หมดอายุ</h2>
        <div class="expiring-list">
          <div v-for="phone in expiringPhonesList" :key="phone.id" class="expiring-item">
            <div class="phone-info">
              <h4>{{ phone.number }}</h4>
              <p>{{ phone.network }} - {{ phone.package }}</p>
            </div>
            <div class="expiry-info">
              <span class="days-left">{{ getDaysLeft(phone.expiryDate) }} วัน</span>
              <span class="expiry-date">{{ formatDate(phone.expiryDate) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Export Section -->
      <section class="export-section">
        <h2>📤 ส่งออกรายงาน</h2>
        <div class="export-controls">
          <button @click="exportToJSON" class="export-button json">
            📄 ส่งออกเป็น JSON
          </button>
          <button @click="exportToCSV" class="export-button csv">
            📊 ส่งออกเป็น CSV
          </button>
          <button @click="printReport" class="export-button print">
            🖨️ พิมพ์รายงาน
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const phones = ref([])

onMounted(() => {
  loadPhones()
})

const loadPhones = () => {
  const savedPhones = localStorage.getItem('phoneNumbers')
  if (savedPhones) {
    phones.value = JSON.parse(savedPhones)
  } else {
    phones.value = []
  }
}

const totalPhones = computed(() => phones.value.length)

const activePhones = computed(() =>
  phones.value.filter(phone => phone.status === 'active').length
)

const expiringPhones = computed(() => {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return phones.value.filter(phone => {
    const expiryDate = new Date(phone.expiryDate)
    return expiryDate <= nextWeek && expiryDate >= today && phone.status === 'active'
  }).length
})

const totalMonthlyCost = computed(() => 0) // Temporarily disabled

const averageCost = computed(() => 0) // Temporarily disabled

const networkStats = computed(() => {
  const networks = ['AIS', 'DTAC', 'TRUE', 'NT']
  return networks.map(network => ({
    name: network,
    count: phones.value.filter(phone => phone.network === network).length
  })).filter(item => item.count > 0)
})

const statusStats = computed(() => {
  const statuses = [
    { name: 'active', label: 'ใช้งาน', class: 'active' },
    { name: 'inactive', label: 'ไม่ใช้งาน', class: 'inactive' },
    { name: 'expired', label: 'หมดอายุ', class: 'expired' }
  ]
  return statuses.map(status => ({
    ...status,
    count: phones.value.filter(phone => phone.status === status.name).length
  })).filter(item => item.count > 0)
})

const networkCosts = computed(() => {
  const networks = ['AIS', 'DTAC', 'TRUE', 'NT']
  return networks.map(network => ({
    name: network,
    cost: 0 // Temporarily disabled cost calculation
  })).filter(item => item.cost > 0)
})

const expiringPhonesList = computed(() => {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return phones.value.filter(phone => {
    const expiryDate = new Date(phone.expiryDate)
    return expiryDate <= nextWeek && expiryDate >= today && phone.status === 'active'
  })
})

const getDaysLeft = (expiryDate) => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
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

const exportToJSON = () => {
  const data = JSON.stringify(phones.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phone-numbers-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportToCSV = () => {
  const headers = ['เบอร์โทรศัพท์', 'ค่ายเครือข่าย', 'แพ็กเกจ', 'ค่าใช้จ่าย/เดือน', 'วันหมดอายุ', 'สถานะ', 'หมายเหตุ']
  const csvContent = [
    headers.join(','),
    ...phones.value.map(phone => [
      phone.number,
      phone.network,
      phone.package || '',
      0, // monthlyCost removed
      phone.expiryDate,
      phone.status,
      phone.notes || ''
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phone-numbers-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const printReport = () => {
  window.print()
}

useHead({
  title: 'รายงานและสถิติ - ระบบจัดการเบอร์มือถือ'
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 3em;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.card-content h3 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 2em;
  font-weight: bold;
}

.card-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1em;
}

.chart-section, .alert-section, .export-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.chart-section h2, .alert-section h2, .export-section h2 {
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.5em;
}

.network-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.network-bar {
  display: flex;
  align-items: center;
  gap: 20px;
}

.network-info {
  min-width: 150px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.network-name {
  font-weight: 600;
  color: #2c3e50;
}

.network-count {
  color: #7f8c8d;
  font-size: 0.9em;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s ease;
}

.bar.ais {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
}

.bar.dtac {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.bar.true {
  background: linear-gradient(90deg, #e74c3c, #ec7063);
}

.bar.nt {
  background: linear-gradient(90deg, #f39c12, #f5b041);
}

.status-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.status-item {
  text-align: center;
}

.status-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-weight: bold;
  color: white;
}

.status-circle.active {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.status-circle.inactive {
  background: linear-gradient(135deg, #f39c12, #f5b041);
}

.status-circle.expired {
  background: linear-gradient(135deg, #e74c3c, #ec7063);
}

.status-percentage {
  font-size: 1.2em;
}

.status-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.status-info p {
  color: #7f8c8d;
  margin: 0;
}

.cost-analysis {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cost-item {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 15px;
}

.cost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cost-amount {
  font-weight: 600;
  color: #27ae60;
}

.cost-bar {
  height: 15px;
  background: #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
}

.cost-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.8s ease;
}

.cost-fill.ais {
  background: #27ae60;
}

.cost-fill.dtac {
  background: #3498db;
}

.cost-fill.true {
  background: #e74c3c;
}

.cost-fill.nt {
  background: #f39c12;
}

.average-cost {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avg-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  margin-top: 20px;
}

.avg-number {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.expiring-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.expiring-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fff5f5;
  border-left: 4px solid #e74c3c;
  border-radius: 8px;
}

.phone-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.phone-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9em;
}

.expiry-info {
  text-align: right;
}

.days-left {
  display: block;
  font-weight: bold;
  color: #e74c3c;
  font-size: 1.1em;
}

.expiry-date {
  color: #7f8c8d;
  font-size: 0.9em;
}

.export-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.export-button {
  padding: 15px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-button.json {
  background: #3498db;
  color: white;
}

.export-button.json:hover {
  background: #2980b9;
}

.export-button.csv {
  background: #27ae60;
  color: white;
}

.export-button.csv:hover {
  background: #219a52;
}

.export-button.print {
  background: #9b59b6;
  color: white;
}

.export-button.print:hover {
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

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .cost-analysis {
    grid-template-columns: 1fr;
  }

  .status-chart {
    grid-template-columns: 1fr;
  }

  .network-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .network-info {
    min-width: auto;
  }

  .export-controls {
    flex-direction: column;
  }

  .expiring-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .expiry-info {
    text-align: left;
  }
}

@media print {
  .navigation, .export-section {
    display: none;
  }

  .phone-management-system {
    background: white;
    box-shadow: none;
  }

  .chart-section, .alert-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>