import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // ใส่ Supabase URL และ Key จริงตรงนี้
  const supabaseUrl = config.public.supabaseUrl || 'YOUR_SUPABASE_URL'
  const supabaseKey = config.public.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY'

  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase
    }
  }
})