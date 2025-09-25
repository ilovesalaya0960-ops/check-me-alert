export const usePhones = () => {
  const { $supabase } = useNuxtApp()

  const phones = ref([])
  const loading = ref(false)
  const error = ref(null)

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
      phones.value = data || []
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

      const { data, error: insertError } = await $supabase
        .from('phone_numbers')
        .insert([{
          phone_number: processedData.number,
          carrier: processedData.network,
          usage_category: processedData.usageCategory,
          package_name: processedData.package,
          monthly_cost: processedData.monthlyCost ? Number(processedData.monthlyCost) : null,
          package_start_date: processedData.packageStartDate || null,
          package_expiry_date: processedData.packageExpiryDate || null,
          sim_expiry_date: processedData.simExpiryDate || null,
          status: processedData.status || 'active',
          notes: processedData.notes || ''
        }])
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
      // คำนวณ packageExpiryDate ใหม่ถ้ามีการเปลี่ยน packageStartDate
      const processedUpdates = {
        phone_number: updates.number,
        carrier: updates.network,
        usage_category: updates.usageCategory,
        package_name: updates.package,
        monthly_cost: updates.monthlyCost ? Number(updates.monthlyCost) : null,
        package_start_date: updates.packageStartDate || null,
        package_expiry_date: updates.packageStartDate ?
          getCalculatedExpiryDate(updates.packageStartDate) : null,
        sim_expiry_date: updates.simExpiryDate || null,
        status: updates.status || 'active',
        notes: updates.notes || ''
      }

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
        .or(`phone_number.ilike.%${query}%,carrier.ilike.%${query}%,usage_category.ilike.%${query}%,package_name.ilike.%${query}%`)
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
      number: dbRecord.phone_number,
      network: dbRecord.carrier,
      usageCategory: dbRecord.usage_category,
      package: dbRecord.package_name,
      monthlyCost: dbRecord.monthly_cost,
      packageStartDate: dbRecord.package_start_date,
      packageExpiryDate: dbRecord.package_expiry_date,
      simExpiryDate: dbRecord.sim_expiry_date,
      status: dbRecord.status,
      notes: dbRecord.notes,
      createdAt: dbRecord.created_at
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