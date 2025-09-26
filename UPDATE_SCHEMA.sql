-- สคริปต์สำหรับอัปเดต database schema ใน production
-- รันไฟล์นี้ใน Supabase SQL Editor

-- ลบตาราง phone_numbers เดิมและ dependencies
DROP VIEW IF EXISTS expiring_phones;
DROP TABLE IF EXISTS phone_numbers CASCADE;

-- สร้างตาราง phone_numbers ใหม่ให้ตรงกับโค้ด Frontend
CREATE TABLE phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  carrier VARCHAR(10) NOT NULL CHECK (carrier IN ('AIS', 'DTAC', 'TRUE', 'NT')),
  usage_category VARCHAR(50),
  package_name VARCHAR(100),
  monthly_cost DECIMAL(10,2),
  package_start_date DATE,
  package_expiry_date DATE,
  sim_expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX idx_phone_numbers_phone ON phone_numbers(phone_number);
CREATE INDEX idx_phone_numbers_carrier ON phone_numbers(carrier);
CREATE INDEX idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX idx_phone_numbers_package_expiry ON phone_numbers(package_expiry_date);
CREATE INDEX idx_phone_numbers_sim_expiry ON phone_numbers(sim_expiry_date);

-- เปิดใช้งาน Row Level Security
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy สำหรับการเข้าถึงข้อมูล (ยอมให้ทุกคนเข้าถึงได้สำหรับ demo)
CREATE POLICY "Enable all operations for all users" ON phone_numbers
  FOR ALL USING (true);

-- สร้าง Function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_phone_numbers_updated_at
    BEFORE UPDATE ON phone_numbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มข้อมูลตัวอย่างใหม่
INSERT INTO phone_numbers (
  phone_number, carrier, usage_category, package_name, monthly_cost,
  package_start_date, package_expiry_date, sim_expiry_date, status, notes
) VALUES
(
  '081-234-5678', 'AIS', 'งาน', 'เน็ต 20GB', 399.00,
  '2024-01-15', '2024-02-14', '2025-01-15', 'active', 'เบอร์หลัก'
),
(
  '082-345-6789', 'DTAC', 'ส่วนตัว', 'โทรไม่อั้น', 299.00,
  '2024-12-28', '2025-01-27', '2025-12-28', 'active', 'เบอร์สำรอง'
),
(
  '083-456-7890', 'TRUE', 'ธุรกิจ', 'เน็ต 10GB', 159.00,
  '2024-12-20', '2025-01-19', '2025-12-20', 'active', 'เบอร์ธุรกิจ'
);

-- สร้าง View สำหรับดูข้อมูลที่ใกล้หมดอายุ
CREATE VIEW expiring_phones AS
SELECT *,
  CASE
    WHEN package_expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND package_expiry_date >= CURRENT_DATE
    THEN 'package_expiring'
    WHEN sim_expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND sim_expiry_date >= CURRENT_DATE
    THEN 'sim_expiring'
    ELSE 'normal'
  END as expiry_status
FROM phone_numbers
WHERE status = 'active'
ORDER BY
  LEAST(
    COALESCE(package_expiry_date, '9999-12-31'::date),
    COALESCE(sim_expiry_date, '9999-12-31'::date)
  ) ASC;

-- ตรวจสอบว่าสร้างสำเร็จ
SELECT 'Schema updated successfully!' as status;
SELECT COUNT(*) as total_phones FROM phone_numbers;