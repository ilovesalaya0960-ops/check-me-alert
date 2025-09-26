import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // ใช้ environment variables
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseAnonKey

  console.log('🔧 Supabase URL:', supabaseUrl) // Debug
  console.log('🔧 Supabase Key:', supabaseKey ? 'Key loaded ✅' : 'Key missing ❌') // Debug

  // Fallback สำหรับ development
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found')
    return {
      provide: {
        supabase: null
      }
    }
  }

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

  return {
    provide: {
      supabase
    }
  }
})