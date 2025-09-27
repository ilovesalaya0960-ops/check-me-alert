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
      supabaseUrl: 'https://shglsckgjpfjqbvythzz.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ2xzY2tnanBmanFidnl0aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODQ4NzcsImV4cCI6MjA3NDM2MDg3N30.lRh2BCMvL68KCmNp4ZvXutIWFtGsYpLv8rcjlEhDWsQ',
    }
  }
})