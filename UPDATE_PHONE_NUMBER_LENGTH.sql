-- แก้ไขความยาวของ phone_number field ให้รองรับเบอร์โทรที่ยาวขึ้น
-- ขยายจาก VARCHAR(15) เป็น VARCHAR(20) เพื่อรองรับรูปแบบเบอร์ที่หลากหลาย

-- อัปเดตความยาวของ phone_number column
ALTER TABLE phone_numbers
ALTER COLUMN phone_number TYPE VARCHAR(20);

-- ตรวจสอบผลลัพธ์
SELECT 'Phone number column length updated successfully!' as status;

-- แสดงข้อมูลตัวอย่างเพื่อทดสอบ
SELECT phone_number, LENGTH(phone_number) as length
FROM phone_numbers
ORDER BY LENGTH(phone_number) DESC
LIMIT 3;