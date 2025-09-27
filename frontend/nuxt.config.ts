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
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://shglsckgjpfjqbvythzz.supabase.co',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ2xzY2tnanBmanFidnl0aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODQ4NzcsImV4cCI6MjA3NDM2MDg3N30.lRh2BCMvL68KCmNp4ZvXutIWFtGsYpLv8rcjlEhDWsQ',
    }
  }
})