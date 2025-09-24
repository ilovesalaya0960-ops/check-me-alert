export default defineNuxtConfig({
  // Simple SPA for Netlify
  ssr: false,

  // App configuration
  app: {
    head: {
      title: 'Phone Management System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})