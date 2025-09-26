<template>
  <div class="phone-management-system">
    <!-- Header -->
    <header class="header">
      <h1>🔢 ระบบจัดการเบอร์มือถือ</h1>
      <p>Phone Number Management System</p>
    </header>

    <!-- Navigation -->
    <nav class="navigation">
      <NuxtLink to="/" class="nav-link active">🏠 หน้าหลัก</NuxtLink>
      <NuxtLink to="/phones" class="nav-link">📱 จัดการเบอร์</NuxtLink>
      <NuxtLink to="/reports" class="nav-link">📊 รายงาน</NuxtLink>
      <NuxtLink to="/settings" class="nav-link">⚙️ ตั้งค่า</NuxtLink>
    </nav>

    <!-- Dashboard Content -->
    <main class="main-content">
      <!-- Stats Cards -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📱</div>
          <div class="stat-info">
            <h3>{{ totalPhones }}</h3>
            <p>เบอร์ทั้งหมด</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🟢</div>
          <div class="stat-info">
            <h3>{{ activePhones }}</h3>
            <p>เบอร์ที่ใช้งาน</p>
          </div>
        </div>

        <NuxtLink to="/phones?filter=package-expiring" class="stat-card clickable">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <h3>{{ expiringPhones }}</h3>
            <p>โปรใกล้หมดอายุ</p>
          </div>
        </NuxtLink>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>{{ totalCost }}</h3>
            <p>ค่าใช้จ่ายรวม/เดือน</p>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>🚀 การดำเนินการด่วน</h2>
        <div class="action-grid">
          <NuxtLink to="/phones" class="action-button">
            <div class="action-icon">➕</div>
            <div class="action-text">
              <h3>เพิ่มเบอร์ใหม่</h3>
              <p>เพิ่มเบอร์มือถือเข้าระบบ</p>
            </div>
          </NuxtLink>

          <NuxtLink to="/phones?filter=expiring" class="action-button">
            <div class="action-icon">🔔</div>
            <div class="action-text">
              <h3>ตรวจสอบการแจ้งเตือน</h3>
              <p>ดูเบอร์ที่ใกล้หมดอายุ</p>
            </div>
          </NuxtLink>

          <NuxtLink to="/reports" class="action-button">
            <div class="action-icon">📈</div>
            <div class="action-text">
              <h3>ดูรายงาน</h3>
              <p>สถิติการใช้งานและค่าใช้จ่าย</p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="recent-activity">
        <h2>📋 กิจกรรมล่าสุด</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Use Supabase for data management
const { phones, loading, error, fetchPhones } = usePhones()

onMounted(async () => {
  console.log('🔌 Testing Supabase connection...')
  try {
    await fetchPhones()
    console.log('✅ Supabase connected successfully!')
    console.log('📊 Loaded phones:', phones.value.length)
  } catch (err) {
    console.error('❌ Supabase connection failed:', err)
  }
})

// Computed values from Supabase data
const totalPhones = computed(() => phones.value.length)

const activePhones = computed(() =>
  phones.value.filter(phone => phone.status === 'active').length
)

const expiringPhones = computed(() => {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return phones.value.filter(phone => {
    if (phone.status !== 'active') return false

    // Check only package expiry for homepage alert
    const packageExpiry = phone.packageExpiryDate ? new Date(phone.packageExpiryDate) : null
    return packageExpiry && packageExpiry <= nextWeek && packageExpiry >= today
  }).length
})

const totalCost = computed(() => {
  const total = phones.value
    .filter(phone => phone.status === 'active')
    .reduce((sum, phone) => sum + (parseFloat(phone.monthlyCost) || 0), 0)
  return `${total.toLocaleString('th-TH')} ฿`
})

// Generate recent activities from real data
const recentActivities = computed(() => {
  const activities = []

  // Get recent phones (sorted by creation date)
  const recentPhones = [...phones.value]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 2)

  // Add recent phone additions
  recentPhones.forEach((phone, index) => {
    activities.push({
      id: `add_${phone.id}`,
      icon: '➕',
      title: 'เพิ่มเบอร์ใหม่',
      description: `${phone.number} (${phone.network}) ถูกเพิ่มเข้าระบบ`,
      time: getTimeAgo(phone.createdAt || new Date().toISOString())
    })
  })

  // Add expiring package alerts only
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const expiringList = phones.value.filter(phone => {
    if (phone.status !== 'active') return false

    const packageExpiry = phone.packageExpiryDate ? new Date(phone.packageExpiryDate) : null
    return packageExpiry && packageExpiry <= nextWeek && packageExpiry >= today
  })

  expiringList.forEach(phone => {
    const packageExpiry = new Date(phone.packageExpiryDate)
    const daysLeft = Math.ceil((packageExpiry - today) / (1000 * 60 * 60 * 24))
    activities.push({
      id: `package_expiry_${phone.id}`,
      icon: '📦',
      title: 'โปรใกล้หมดอายุ',
      description: `${phone.number} (${phone.network}) โปรจะหมดอายุในอีก ${daysLeft} วัน`,
      time: 'เมื่อสักครู่'
    })
  })

  // Temporarily disable cost summary
  // const activeCost = phones.value
  //   .filter(phone => phone.status === 'active')
  //   .reduce((sum, phone) => sum + (phone.monthlyCost || 0), 0)

  // If no activities, show welcome message
  if (activities.length === 0) {
    activities.push({
      id: 'welcome',
      icon: '🎉',
      title: 'ยินดีต้อนรับ',
      description: 'เริ่มต้นใช้งานด้วยการเพิ่มเบอร์มือถือแรกของคุณ',
      time: 'เมื่อสักครู่'
    })
  }

  return activities.slice(0, 3) // Show only 3 most recent
})

const getCalculatedExpiryDate = (startDate) => {
  if (!startDate) return ''
  const start = new Date(startDate)
  const expiry = new Date(start)
  expiry.setDate(start.getDate() + 30)
  return expiry.toISOString().split('T')[0]
}

const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'เมื่อสักครู่'
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  if (diffDays === 1) return 'เมื่อวาน'
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  return date.toLocaleDateString('th-TH')
}

useHead({
  title: 'ระบบจัดการเบอร์มือถือ - หน้าหลัก',
  meta: [
    { name: 'description', content: 'ระบบจัดการเบอร์มือถือ สำหรับติดตามและจัดการเบอร์โทรศัพท์ทุกค่าย' }
  ]
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.clickable {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.2);
  border: 2px solid #3498db;
}

.stat-icon {
  font-size: 3em;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.stat-info h3 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 2em;
  font-weight: bold;
}

.stat-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1em;
}

.quick-actions, .recent-activity {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.quick-actions h2, .recent-activity h2 {
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.5em;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.action-button:hover {
  border-color: #3498db;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.2);
}

.action-icon {
  font-size: 2.5em;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.action-text h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.action-text p {
  color: #7f8c8d;
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-left: 4px solid #3498db;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5em;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

.activity-content h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.activity-content p {
  color: #5a6c7d;
  margin: 0 0 5px 0;
}

.activity-time {
  color: #95a5a6;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .phone-management-system {
    padding: 15px;
  }

  .navigation {
    flex-direction: column;
    text-align: center;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>