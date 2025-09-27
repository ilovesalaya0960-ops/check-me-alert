// Mock data สำหรับกรณีที่ Supabase ไม่พร้อม (ใช้ field names ใหม่)
const getMockData = () => [
  {
    id: '1',
    phone_number: '081-234-5678',
    carrier: 'AIS',
    category: 'งาน',
    promotion: 'เน็ต 20GB',
    promotion_start_date: '2024-01-15',
    promotion_end_date: '2025-02-14',
    sim_expiry_date: '2025-01-15',
    status: 'active',
    notes: 'เบอร์หลัก',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    phone_number: '082-345-6789',
    carrier: 'DTAC',
    category: 'ส่วนตัว',
    promotion: 'โทรไม่อั้น',
    promotion_start_date: '2024-12-28',
    promotion_end_date: '2025-01-27',
    sim_expiry_date: '2025-12-28',
    status: 'active',
    notes: 'เบอร์สำรอง',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    phone_number: '083-456-7890',
    carrier: 'TRUE',
    category: 'ธุรกิจ',
    promotion: 'เน็ต 10GB',
    promotion_start_date: '2024-12-20',
    promotion_end_date: '2025-01-19',
    sim_expiry_date: '2025-12-20',
    status: 'active',
    notes: 'เบอร์ธุรกิจ',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    phone_number: '084-567-8901',
    carrier: 'NT',
    category: 'ส่วนตัว',
    promotion: 'เน็ต 5GB',
    promotion_start_date: '2024-12-25',
    promotion_end_date: '2025-01-24',
    sim_expiry_date: '2025-12-25',
    status: 'active',
    notes: 'เบอร์เก่า',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    phone_number: '085-678-9012',
    carrier: 'AIS',
    category: 'งาน',
    promotion: 'เน็ต 50GB',
    promotion_start_date: '2024-12-30',
    promotion_end_date: '2025-01-29',
    sim_expiry_date: '2025-12-30',
    status: 'active',
    notes: 'เบอร์ใหม่',
    created_at: new Date().toISOString()
  }
]

export const usePhones = () => {
  const { $supabase } = useNuxtApp()

  const phones = ref([])
  const loading = ref(false)
  const error = ref(null)

  // สร้าง Supabase client ใหม่หากไม่มี
  let supabaseClient = $supabase

  if (!supabaseClient) {
    console.warn('⚠️ Creating new Supabase client directly')
    try {
      // Import Supabase และสร้าง client ใหม่
      const { createClient } = require('@supabase/supabase-js')
      supabaseClient = createClient(
        'https://shglsckgjpfjqbvythzz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ2xzY2tnanBmanFidnl0aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODQ4NzcsImV4cCI6MjA3NDM2MDg3N30.lRh2BCMvL68KCmNp4ZvXutIWFtGsYpLv8rcjlEhDWsQ'
      )
      console.log('✅ Created Supabase client directly')
    } catch (importError) {
      console.error('❌ Failed to create Supabase client:', importError)

      // ถ้าไม่สามารถสร้าง client ได้ ให้ใช้ mock data
      phones.value = getMockData()
      return {
        phones: readonly(phones),
        loading: readonly(loading),
        error: readonly(error),
        fetchPhones: async () => {
          phones.value = getMockData()
          console.log('✅ Using mock data fallback:', phones.value.length, 'phones')
        },
        addPhone: () => Promise.resolve(null),
        updatePhone: () => Promise.resolve(null),
        deletePhone: () => Promise.resolve(),
        searchPhones: () => Promise.resolve([]),
        getCalculatedExpiryDate: () => null
      }
    }
  }

  // Supabase client พร้อมใช้งาน
  console.log('✅ Supabase client ready, using real database')

  // ดึงข้อมูลเบอร์ทั้งหมด
  const fetchPhones = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 Attempting to connect to Supabase...')

      const { data, error: fetchError } = await supabaseClient
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Supabase query error:', fetchError)
        throw fetchError
      }

      console.log('📄 Raw Supabase data:', data)

      // ไม่ต้องแปลง field names แล้ว เพราะใช้ field names เดียวกัน
      phones.value = data || []
      console.log('✅ Successfully loaded from Supabase:', phones.value.length, 'phones')

      if (data && data.length > 0) {
        console.log('📄 First record:', data[0])
        error.value = null
      } else {
        console.log('📄 No data in database - this is normal for a new setup')
        error.value = null // ไม่ใช่ error ถ้าไม่มีข้อมูล
      }
    } catch (err) {
      console.error('❌ Supabase connection failed:', err.message)
      console.error('📋 Full error:', err)

      // ไม่ fallback ไป mock data แล้ว - ให้แสดง error จริงๆ
      phones.value = []
      error.value = `เชื่อมต่อฐานข้อมูลไม่ได้: ${err.message}`

      // แต่ถ้าเป็น development ให้ใช้ mock data
      if (process.dev) {
        console.log('🔄 Development mode: falling back to mock data')
        phones.value = getMockData()
        error.value = `Development mode - using mock data: ${err.message}`
      }
    } finally {
      loading.value = false
    }
  }

  // เพิ่มเบอร์ใหม่
  const addPhone = async (phoneData) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Adding phone with data:', phoneData)

      // ตรวจสอบและทำความสะอาดข้อมูลก่อนส่ง
      const cleanData = {
        phone_number: phoneData.phone_number?.trim() || '',
        carrier: phoneData.carrier || 'AIS',
        category: phoneData.category?.trim() || null,
        promotion: phoneData.promotion?.trim() || null,
        promotion_start_date: phoneData.promotion_start_date || null,
        promotion_end_date: phoneData.promotion_end_date || null,
        sim_expiry_date: phoneData.sim_expiry_date || null,
        notes: phoneData.notes?.trim() || null,
        status: phoneData.status || 'active'
      }

      console.log('🚀 Clean data for Supabase:', cleanData)

      const { data, error: insertError } = await supabaseClient
        .from('phone_numbers')
        .insert([cleanData])
        .select()

      if (insertError) {
        console.error('❌ Insert error:', insertError)
        throw insertError
      }

      console.log('✅ Inserted data:', data)

      if (data && data.length > 0) {
        phones.value.unshift(data[0])
      }
      return data[0]
    } catch (err) {
      console.error('❌ Failed to add phone:', err)

      // Handle specific error types
      let userMessage = 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล'

      if (err.code === '22001') {
        userMessage = 'เบอร์โทรศัพท์ยาวเกินไป (ไม่เกิน 20 ตัวอักษร)'
      } else if (err.code === '23505') {
        userMessage = 'เบอร์โทรศัพท์นี้มีในระบบแล้ว'
      } else if (err.code === '23502') {
        userMessage = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
      } else if (err.message.includes('fetch')) {
        userMessage = 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้'
      } else {
        userMessage = `${userMessage}: ${err.message}`
      }

      error.value = userMessage
      throw new Error(userMessage)
    } finally {
      loading.value = false
    }
  }

  // แก้ไขข้อมูลเบอร์
  const updatePhone = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Updating phone:', id, updates)

      // ตรวจสอบและทำความสะอาดข้อมูลก่อนส่ง
      const cleanUpdates = {
        phone_number: updates.phone_number?.trim() || '',
        carrier: updates.carrier || 'AIS',
        category: updates.category?.trim() || null,
        promotion: updates.promotion?.trim() || null,
        promotion_start_date: updates.promotion_start_date || null,
        promotion_end_date: updates.promotion_end_date || null,
        sim_expiry_date: updates.sim_expiry_date || null,
        notes: updates.notes?.trim() || null,
        status: updates.status || 'active'
      }

      console.log('🔄 Clean update data for Supabase:', cleanUpdates)

      const { data, error: updateError } = await supabaseClient
        .from('phone_numbers')
        .update(cleanUpdates)
        .eq('id', id)
        .select()

      if (updateError) {
        console.error('❌ Update error:', updateError)
        throw updateError
      }

      console.log('✅ Updated data:', data)

      // อัปเดตข้อมูลใน array
      const index = phones.value.findIndex(phone => phone.id === id)
      if (index !== -1 && data && data.length > 0) {
        phones.value[index] = data[0]
      }
      return data[0]
    } catch (err) {
      console.error('❌ Failed to update phone:', err)

      // Handle specific error types
      let userMessage = 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล'

      if (err.code === '22001') {
        userMessage = 'เบอร์โทรศัพท์ยาวเกินไป (ไม่เกิน 20 ตัวอักษร)'
      } else if (err.code === '23505') {
        userMessage = 'เบอร์โทรศัพท์นี้มีในระบบแล้ว'
      } else if (err.code === '23502') {
        userMessage = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
      } else if (err.message.includes('fetch')) {
        userMessage = 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้'
      } else {
        userMessage = `${userMessage}: ${err.message}`
      }

      error.value = userMessage
      throw new Error(userMessage)
    } finally {
      loading.value = false
    }
  }

  // ลบเบอร์
  const deletePhone = async (id) => {
    loading.value = true
    error.value = null

    try {
      console.log('🗑️ Deleting phone:', id)

      const { error: deleteError } = await supabaseClient
        .from('phone_numbers')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('❌ Delete error:', deleteError)
        throw deleteError
      }

      console.log('✅ Phone deleted successfully')

      // ลบออกจาก array
      phones.value = phones.value.filter(phone => phone.id !== id)
    } catch (err) {
      console.error('❌ Failed to delete phone:', err)
      error.value = `เกิดข้อผิดพลาดในการลบข้อมูล: ${err.message}`
      throw err
    } finally {
      loading.value = false
    }
  }

  // ค้นหาเบอร์
  const searchPhones = async (query) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: searchError } = await supabaseClient
        .from('phone_numbers')
        .select('*')
        .or(`phone_number.ilike.%${query}%,carrier.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (searchError) throw searchError
      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Search failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper function: คำนวณวันหมดอายุโปร (เดิม)
  const getCalculatedExpiryDate = (startDate) => {
    if (!startDate) return null
    const start = new Date(startDate)
    const expiry = new Date(start)
    expiry.setDate(start.getDate() + 30)
    return expiry.toISOString().split('T')[0]
  }

  return {
    phones: readonly(phones),
    loading: readonly(loading),
    error: readonly(error),
    fetchPhones,
    addPhone,
    updatePhone,
    deletePhone,
    searchPhones,
    getCalculatedExpiryDate
  }
}