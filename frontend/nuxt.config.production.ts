export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'https://your-backend.railway.app/api/v1'
    }
  },
  ssr: false,
  nitro: {
    preset: 'static'
  },
  generate: {
    routes: ['/']
  },
  // Production optimizations
  css: ['~/assets/css/main.css'],
  build: {
    extractCSS: true,
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  },
  // SEO and Meta
  app: {
    head: {
      title: 'ระบบจัดการเบอร์มือถือ',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ระบบจัดการข้อมูลเบอร์มือถือและโปรโมชั่น' }
      ]
    }
  }
})