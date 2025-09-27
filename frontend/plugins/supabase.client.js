import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // ใช้ environment variables พร้อม fallback
  let supabaseUrl = config.public.supabaseUrl
  let supabaseKey = config.public.supabaseAnonKey

  // Debug environment variables
  console.log('🔧 Config object:', config.public)
  console.log('🔧 Supabase URL:', supabaseUrl || 'MISSING')
  console.log('🔧 Supabase Key:', supabaseKey ? 'Key loaded ✅' : 'Key missing ❌')

  // Hard-coded fallback for production (temporary)
  if (!supabaseUrl || supabaseUrl === 'undefined') {
    supabaseUrl = 'https://shglsckgjpfjqbvythzz.supabase.co'
    console.log('🔄 Using fallback URL:', supabaseUrl)
  }

  if (!supabaseKey || supabaseKey === 'undefined') {
    supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ2xzY2tnanBmanFidnl0aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODQ4NzcsImV4cCI6MjA3NDM2MDg3N30.lRh2BCMvL68KCmNp4ZvXutIWFtGsYpLv8rcjlEhDWsQ'
    console.log('🔄 Using fallback Key')
  }

  // Final check
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials still missing after fallback')
    return {
      provide: {
        supabase: null
      }
    }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false // ปิด auth session เพื่อลดปัญหา
      },
      global: {
        headers: {
          'X-Client-Info': 'phone-management-app'
        }
      }
    })

    console.log('✅ Supabase client initialized successfully')

    // Test connection
    supabase.from('phone_numbers').select('count').single()
      .then(() => console.log('🔗 Supabase connection test: SUCCESS'))
      .catch(err => console.warn('⚠️ Supabase connection test failed:', err.message))

    return {
      provide: {
        supabase
      }
    }
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    return {
      provide: {
        supabase: null
      }
    }
  }
})