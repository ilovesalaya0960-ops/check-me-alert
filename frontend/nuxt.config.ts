export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static'
  },
  generate: {
    dir: 'dist'
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
})