export default defineNuxtConfig({
  devtools: { enabled: true },
  // modules: ['@nuxtjs/tailwindcss'],  // Temporarily removed for deployment

  // Netlify deployment configuration
  nitro: {
    preset: 'netlify'
  },

  // Runtime configuration
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Phone Number Management System',
      domain: process.env.NUXT_PUBLIC_DOMAIN || 'localhost',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  // App configuration
  app: {
    head: {
      title: 'ระบบจัดการเบอร์มือถือ',
      titleTemplate: '%s - Phone Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'ระบบจัดการข้อมูลเบอร์มือถือและการแจ้งเตือนผ่าน Telegram' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // CSS configuration
  css: [
    '~/assets/css/main.css'
  ],

  // Build configuration
  build: {
    transpile: []
  },

  // Disable SSR for SPA mode (better for Netlify)
  ssr: false,

  // Generate configuration for static sites
  generate: {
    fallback: true
  }
})