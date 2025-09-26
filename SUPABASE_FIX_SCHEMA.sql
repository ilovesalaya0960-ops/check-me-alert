-- 🛠️ แก้ไข Supabase Database Schema สำหรับการบันทึกข้อมูล
-- รัน script นี้ใน Supabase SQL Editor

-- ลบตารางเดิมและสร้างใหม่
DROP TABLE IF EXISTS phone_numbers CASCADE;
DROP VIEW IF EXISTS expiring_phones CASCADE;

-- สร้างตาราง phone_numbers ใหม่ (ใช้ field names ที่ง่ายกว่า)
CREATE TABLE phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(15) NOT NULL,
  carrier VARCHAR(10) NOT NULL,
  category VARCHAR(50),
  promotion VARCHAR(100),
  promotion_start_date DATE,
  promotion_end_date DATE,
  sim_expiry_date DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง indexes (ไม่ใส่ UNIQUE constraint ที่เข้มงวด)
CREATE INDEX idx_phone_numbers_carrier ON phone_numbers(carrier);
CREATE INDEX idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX idx_phone_numbers_phone ON phone_numbers(phone_number);

-- เปิด Row Level Security
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy ที่อนุญาตทุกอย่าง (สำหรับ public access)
DROP POLICY IF EXISTS "Enable all operations for all users" ON phone_numbers;
CREATE POLICY "Enable all operations for all users" ON phone_numbers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัปเดต updated_at
DROP TRIGGER IF EXISTS update_phone_numbers_updated_at ON phone_numbers;
CREATE TRIGGER update_phone_numbers_updated_at
    BEFORE UPDATE ON phone_numbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มข้อมูลทดสอบ
INSERT INTO phone_numbers (
  phone_number, carrier, category, promotion,
  promotion_start_date, promotion_end_date, sim_expiry_date, notes
) VALUES
(
  '081-234-5678', 'AIS', 'ส่วนตัว', 'เน็ตไม่อั้น 30GB',
  '2024-01-01', '2024-12-31', '2025-12-31', 'เบอร์หลัก'
),
(
  '082-345-6789', 'DTAC', 'งาน', 'โทรไม่อั้น',
  '2024-06-01', '2025-05-31', '2025-12-31', 'เบอร์ทำงาน'
),
(
  '083-456-7890', 'TRUE', 'ธุรกิจ', 'เน็ต 10GB',
  '2024-03-01', '2025-02-28', '2025-12-31', 'เบอร์ธุรกิจ'
),
(
  '084-567-8901', 'NT', 'สำรอง', 'เน็ต 5GB',
  '2024-09-01', '2025-08-31', '2025-12-31', 'เบอร์สำรอง'
),
(
  '085-678-9012', 'AIS', 'ครอบครัว', 'เน็ต 50GB',
  '2024-11-01', '2025-10-31', '2025-12-31', 'เบอร์ครอบครัว'
);

-- ตรวจสอบผลลัพธ์
SELECT 'Database schema fixed successfully!' as status;
SELECT COUNT(*) as total_phones FROM phone_numbers;
SELECT phone_number, carrier, category FROM phone_numbers LIMIT 3;