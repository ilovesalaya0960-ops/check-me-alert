// Mock data สำหรับกรณีที่ Supabase ไม่พร้อม
const getMockData = () => [
  {
    id: '1',
    number: '081-234-5678',
    network: 'AIS',
    usageCategory: 'งาน',
    package: 'เน็ต 20GB',
    monthlyCost: '399',
    packageStartDate: '2024-01-15',
    packageExpiryDate: '2025-02-14',
    simExpiryDate: '2025-01-15',
    status: 'active',
    notes: 'เบอร์หลัก',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    number: '082-345-6789',
    network: 'DTAC',
    usageCategory: 'ส่วนตัว',
    package: 'โทรไม่อั้น',
    monthlyCost: '299',
    packageStartDate: '2024-12-28',
    packageExpiryDate: '2025-01-27',
    simExpiryDate: '2025-12-28',
    status: 'active',
    notes: 'เบอร์สำรอง',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    number: '083-456-7890',
    network: 'TRUE',
    usageCategory: 'ธุรกิจ',
    package: 'เน็ต 10GB',
    monthlyCost: '159',
    packageStartDate: '2024-12-20',
    packageExpiryDate: '2025-01-19',
    simExpiryDate: '2025-12-20',
    status: 'active',
    notes: 'เบอร์ธุรกิจ',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    number: '084-567-8901',
    network: 'NT',
    usageCategory: 'ส่วนตัว',
    package: 'เน็ต 5GB',
    monthlyCost: '99',
    packageStartDate: '2024-12-25',
    packageExpiryDate: '2025-01-24',
    simExpiryDate: '2025-12-25',
    status: 'active',
    notes: 'เบอร์เก่า',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    number: '085-678-9012',
    network: 'AIS',
    usageCategory: 'งาน',
    package: 'เน็ต 50GB',
    monthlyCost: '599',
    packageStartDate: '2024-12-30',
    packageExpiryDate: '2025-01-29',
    simExpiryDate: '2025-12-30',
    status: 'active',
    notes: 'เบอร์ใหม่',
    createdAt: new Date().toISOString()
  }
]

export const usePhones = () => {
  const { $supabase } = useNuxtApp()

  const phones = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Check if Supabase is available
  if (!$supabase) {
    console.warn('Supabase not available, using mock data')

    // Return mock functions ที่ใช้ localStorage แทน
    return {
      phones: readonly(phones),
      loading: readonly(loading),
      error: readonly(error),
      fetchPhones: async () => {
        loading.value = true
        try {
          // ใช้ mock data
          phones.value = getMockData()
          console.log('✅ Loaded mock data:', phones.value.length, 'phones')
        } catch (err) {
          error.value = 'Failed to load mock data'
        } finally {
          loading.value = false
        }
      },
      addPhone: () => Promise.resolve(null),
      updatePhone: () => Promise.resolve(null),
      deletePhone: () => Promise.resolve(),
      searchPhones: () => Promise.resolve([]),
      convertDbToFrontend: (data) => data,
      getCalculatedExpiryDate: () => null
    }
  }

  // ดึงข้อมูลเบอร์ทั้งหมด
  const fetchPhones = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 Attempting to connect to Supabase...')

      const { data, error: fetchError } = await $supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Supabase query error:', fetchError)
        throw fetchError
      }

      if (data && data.length > 0) {
        phones.value = data.map(convertDbToFrontend)
        console.log('✅ Successfully loaded from Supabase:', phones.value.length, 'phones')
        error.value = null
      } else {
        console.warn('⚠️ Supabase returned empty data, using mock data')
        phones.value = getMockData()
        error.value = 'ไม่มีข้อมูลใน database - ใช้ข้อมูลตัวอย่าง'
      }
    } catch (err) {
      console.warn('❌ Supabase connection failed:', err.message)
      console.log('🔄 Falling back to mock data...')

      // Fallback to mock data เมื่อ Supabase ล้มเหลว
      phones.value = getMockData()
      error.value = `ใช้ข้อมูลตัวอย่าง - ${err.message}`
    } finally {
      loading.value = false
    }
  }

  // เพิ่มเบอร์ใหม่
  const addPhone = async (phoneData) => {
    loading.value = true
    error.value = null

    try {
      // คำนวณ packageExpiryDate อัตโนมัติ
      const processedData = {
        ...phoneData,
        packageExpiryDate: phoneData.packageStartDate ?
          getCalculatedExpiryDate(phoneData.packageStartDate) : null
      }

      // ใช้ข้อมูลตาม database schema ที่ครบถ้วน
      const insertData = {
        phone_number: processedData.number,
        carrier: processedData.network,
        status: processedData.status || 'active'
      }

      // เพิ่ม fields อื่นๆ ถ้ามี
      if (processedData.notes) {
        insertData.notes = processedData.notes
      }

      if (processedData.usageCategory) {
        insertData.usage_category = processedData.usageCategory
      }

      if (processedData.package) {
        insertData.package_name = processedData.package
      }

      if (processedData.monthlyCost) {
        insertData.monthly_cost = parseFloat(processedData.monthlyCost)
      }

      if (processedData.packageStartDate) {
        insertData.package_start_date = processedData.packageStartDate
      }

      if (processedData.packageExpiryDate) {
        insertData.package_expiry_date = processedData.packageExpiryDate
      }

      if (processedData.simExpiryDate) {
        insertData.sim_expiry_date = processedData.simExpiryDate
      }

      console.log('🚀 Inserting data to Supabase:', insertData)

      const { data, error: insertError } = await $supabase
        .from('phone_numbers')
        .insert([insertData])
        .select()

      if (insertError) throw insertError
      if (data && data.length > 0) {
        // แปลงข้อมูลกลับเป็นรูปแบบที่ frontend ใช้
        const newPhone = convertDbToFrontend(data[0])
        phones.value.unshift(newPhone)
      }
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Failed to add phone:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // แก้ไขข้อมูลเบอร์
  const updatePhone = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      // ใช้ข้อมูลตาม database schema ที่ครบถ้วน
      const processedUpdates = {
        phone_number: updates.number,
        carrier: updates.network,
        status: updates.status || 'active'
      }

      // เพิ่ม fields อื่นๆ ถ้ามี
      if (updates.notes) {
        processedUpdates.notes = updates.notes
      }

      if (updates.usageCategory) {
        processedUpdates.usage_category = updates.usageCategory
      }

      if (updates.package) {
        processedUpdates.package_name = updates.package
      }

      if (updates.monthlyCost) {
        processedUpdates.monthly_cost = parseFloat(updates.monthlyCost)
      }

      if (updates.packageStartDate) {
        processedUpdates.package_start_date = updates.packageStartDate
        processedUpdates.package_expiry_date = getCalculatedExpiryDate(updates.packageStartDate)
      }

      if (updates.packageExpiryDate) {
        processedUpdates.package_expiry_date = updates.packageExpiryDate
      }

      if (updates.simExpiryDate) {
        processedUpdates.sim_expiry_date = updates.simExpiryDate
      }

      console.log('🔄 Updating data in Supabase:', processedUpdates)

      const { data, error: updateError } = await $supabase
        .from('phone_numbers')
        .update(processedUpdates)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      // อัปเดตข้อมูลใน array
      const index = phones.value.findIndex(phone => phone.id === id)
      if (index !== -1 && data && data.length > 0) {
        phones.value[index] = convertDbToFrontend(data[0])
      }
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Failed to update phone:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ลบเบอร์
  const deletePhone = async (id) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await $supabase
        .from('phone_numbers')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // ลบออกจาก array
      phones.value = phones.value.filter(phone => phone.id !== id)
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete phone:', err)
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
      const { data, error: searchError } = await $supabase
        .from('phone_numbers')
        .select('*')
        .or(`phone_number.ilike.%${query}%,carrier.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (searchError) throw searchError
      return (data || []).map(convertDbToFrontend)
    } catch (err) {
      error.value = err.message
      console.error('Search failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper function: แปลงข้อมูลจาก database เป็น frontend format
  const convertDbToFrontend = (dbRecord) => {
    return {
      id: dbRecord.id,
      number: dbRecord.phone_number || '',
      network: dbRecord.carrier || '',
      usageCategory: dbRecord.usage_category || '',
      package: dbRecord.package_name || '',
      monthlyCost: dbRecord.monthly_cost || '',
      packageStartDate: dbRecord.package_start_date || '',
      packageExpiryDate: dbRecord.package_expiry_date || '',
      simExpiryDate: dbRecord.sim_expiry_date || '',
      status: dbRecord.status || 'active',
      notes: dbRecord.notes || '',
      createdAt: dbRecord.created_at || new Date().toISOString()
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
    convertDbToFrontend,
    getCalculatedExpiryDate
  }
}