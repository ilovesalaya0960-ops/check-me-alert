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

        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <h3>{{ expiringPhones }}</h3>
            <p>ใกล้หมดอายุ</p>
          </div>
        </div>

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
import { ref } from 'vue'

// Sample data
const totalPhones = ref(25)
const activePhones = ref(23)
const expiringPhones = ref(3)
const totalCost = ref('4,850 ฿')

const recentActivities = ref([
  {
    id: 1,
    icon: '➕',
    title: 'เพิ่มเบอร์ใหม่',
    description: '081-234-5678 (AIS) ถูกเพิ่มเข้าระบบ',
    time: '5 นาทีที่แล้ว'
  },
  {
    id: 2,
    icon: '🔔',
    title: 'แจ้งเตือนหมดอายุ',
    description: '082-345-6789 (DTAC) จะหมดอายุในอีก 7 วัน',
    time: '1 ชั่วโมงที่แล้ว'
  },
  {
    id: 3,
    icon: '💰',
    title: 'ต่ออายุแพ็กเกจ',
    description: '083-456-7890 (TRUE) ต่ออายุแพ็กเกจเรียบร้อย',
    time: '3 ชั่วโมงที่แล้ว'
  }
])

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