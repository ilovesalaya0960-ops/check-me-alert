<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Global app configuration
useHead({
  titleTemplate: '%s - Phone Management System',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { hid: 'description', name: 'description', content: 'ระบบจัดการข้อมูลเบอร์มือถือและการแจ้งเตือนผ่าง Telegram' }
  ]
})
</script>

<style>
/* Global styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
}
</style>