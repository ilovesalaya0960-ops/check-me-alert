export const usePhones = () => {
  const { $supabase } = useNuxtApp()

  const phones = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Check if Supabase is available
  if (!$supabase) {
    error.value = 'Supabase not initialized'
    console.error('Supabase client not available')
    return {
      phones: readonly(phones),
      loading: readonly(loading),
      error: readonly(error),
      fetchPhones: () => Promise.resolve([]),
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
      const { data, error: fetchError } = await $supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      phones.value = (data || []).map(convertDbToFrontend)
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch phones:', err)
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