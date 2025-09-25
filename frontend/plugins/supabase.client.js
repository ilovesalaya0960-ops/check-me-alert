import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // ใช้ environment variables
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseAnonKey

  // Fallback สำหรับ development
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found')
    return {
      provide: {
        supabase: null
      }
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase
    }
  }
})