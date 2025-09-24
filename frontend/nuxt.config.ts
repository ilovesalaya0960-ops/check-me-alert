export default defineNuxtConfig({
  devtools: { enabled: true },

  // Simple SPA for Netlify
  ssr: false,

  // App configuration
  app: {
    head: {
      title: 'Phone Management System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Phone Number Management System' }
      ]
    }
  },

  // CSS configuration
  css: [
    '~/assets/css/main.css'
  ],

  // Generate configuration for static sites
  generate: {
    fallback: true
  }
})