<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Phone Management</h1>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Phone Management System
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          A simple system for managing phone numbers
        </p>

        <div class="bg-white rounded-lg shadow p-8">
          <h3 class="text-xl font-semibold mb-4">System Status</h3>
          <p class="text-green-600 text-lg">✅ Application is running successfully!</p>
          <p class="text-gray-500 mt-2">Deployed on Netlify</p>
          <p class="text-sm text-gray-400 mt-4">Built with Nuxt 3 • {{ new Date().toLocaleString() }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
useHead({
  title: 'Phone Management System',
  meta: [
    { name: 'description', content: 'Simple Phone Number Management System' }
  ]
})
</script>