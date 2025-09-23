<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-8">
            ระบบบันทึกข้อมูลเบอร์มือถือ
          </h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">
            <NuxtLink
              to="/phone-numbers"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <PhoneIcon class="h-8 w-8 text-blue-600" />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">จัดการเบอร์</h3>
                    <p class="text-sm text-gray-500">ดูรายการเบอร์ทั้งหมด</p>
                  </div>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/phone-numbers/create"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <PlusIcon class="h-8 w-8 text-green-600" />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">เพิ่มเบอร์ใหม่</h3>
                    <p class="text-sm text-gray-500">บันทึกข้อมูลเบอร์ใหม่</p>
                  </div>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/phone-numbers/expiring"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <ExclamationTriangleIcon class="h-8 w-8 text-orange-600" />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">ใกล้หมดอายุ</h3>
                    <p class="text-sm text-gray-500">เช็คเบอร์ที่จะหมดอายุ</p>
                  </div>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/phone-numbers/stats"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <ChartBarIcon class="h-8 w-8 text-purple-600" />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">สถิติ</h3>
                    <p class="text-sm text-gray-500">สถิติแยกตามค่าย</p>
                  </div>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/telegram"
              class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <BellIcon class="h-8 w-8 text-indigo-600" />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">แจ้งเตือน</h3>
                    <p class="text-sm text-gray-500">ตั้งค่า Telegram</p>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PhoneIcon, PlusIcon, ExclamationTriangleIcon, ChartBarIcon, BellIcon } from '@heroicons/vue/24/outline'

useHead({
  title: 'ระบบบันทึกข้อมูลเบอร์มือถือ'
})
</script>