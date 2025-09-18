# Database Management Scripts

ชุดคำสั่งสำหรับจัดการฐานข้อมูล MongoDB ของระบบจัดการเบอร์มือถือ

## 📁 ไฟล์ในโฟลเดอร์ scripts

| ไฟล์ | คำอธิบาย | การใช้งาน |
|------|----------|-----------|
| `create-indexes.js` | สร้าง indexes สำหรับ performance | รันครั้งแรกหลังติดตั้ง |
| `seed-data.js` | เพิ่มข้อมูลตัวอย่าง | รันครั้งแรกหลังติดตั้ง |
| `monitoring.js` | ตรวจสอบสถานะและ performance | รันเป็นประจำ |
| `maintenance.js` | ทำความสะอาดและบำรุงรักษา | รันอัตโนมัติ |
| `backup-restore.sh` | สำรองและกู้คืนข้อมูล | ตามต้องการ |

---

## 🚀 การติดตั้งและเริ่มต้น

### 1. สร้าง Indexes (รันครั้งแรก)
```bash
# รันใน Docker container
docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < scripts/create-indexes.js

# หรือรันใน MongoDB local
mongosh --username admin --password password123 --authenticationDatabase admin < scripts/create-indexes.js
```

### 2. เพิ่มข้อมูลตัวอย่าง (รันครั้งแรก)
```bash
# รันใน Docker container
docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < scripts/seed-data.js

# หรือรันใน MongoDB local
mongosh --username admin --password password123 --authenticationDatabase admin < scripts/seed-data.js
```

---

## 📊 การตรวจสอบระบบ

### ตรวจสอบสถานะฐานข้อมูล
```bash
# รันใน Docker container
docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < scripts/monitoring.js

# หรือรันใน MongoDB local
mongosh --username admin --password password123 --authenticationDatabase admin < scripts/monitoring.js
```

#### รายงานที่ได้
- 📈 ข้อมูลสถิติฐานข้อมูล
- 📚 สถิติแต่ละ collection
- 🔍 การใช้งาน indexes
- 🏥 ตรวจสอบความถูกต้องของข้อมูล
- ⏰ วิเคราะห์วันหมดอายุ
- ⚡ ประสิทธิภาพ queries
- 📈 กิจกรรมล่าสุด
- 💡 คำแนะนำ

---

## 🔧 การบำรุงรักษา

### รันการบำรุงรักษาอัตโนมัติ
```bash
# รันใน Docker container
docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < scripts/maintenance.js

# หรือรันใน MongoDB local
mongosh --username admin --password password123 --authenticationDatabase admin < scripts/maintenance.js
```

#### งานที่ทำอัตโนมัติ
- 🗑️ ลบ notification logs เก่า (>90 วัน)
- ⚠️ อัพเดทสถานะเบอร์ที่หมดอายุ
- 📊 Reindex collections ขนาดใหญ่
- 💿 Compact collections ที่มี fragmentation สูง
- 🔍 วิเคราะห์การใช้งาน indexes
- ✅ ตรวจสอบความสมบูรณ์ของข้อมูล
- 📬 ตรวจสอบสถานะการแจ้งเตือน
- 📝 บันทึก maintenance log

### กำหนดการรันอัตโนมัติ (Cron Job)
```bash
# รันทุกวันเวลา 02:00
0 2 * * * docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < /path/to/scripts/maintenance.js

# รันทุกสัปดาห์ วันอาทิตย์ เวลา 03:00
0 3 * * 0 docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < /path/to/scripts/monitoring.js
```

---

## 💾 การสำรองและกู้คืนข้อมูล

### สำรองข้อมูล

#### สำรองแบบเต็ม (Full Backup)
```bash
./scripts/backup-restore.sh backup full
```

#### สำรองแบบเพิ่มหน่วย (Incremental Backup)
```bash
./scripts/backup-restore.sh backup incremental
```

#### สำรอง Collection เฉพาะ
```bash
./scripts/backup-restore.sh backup collection phone_numbers
./scripts/backup-restore.sh backup collection notification_logs
```

### กู้คืนข้อมูล

#### กู้คืนแบบเต็ม
```bash
./scripts/backup-restore.sh restore full /backup/phone_management/full_20241225_120000.tar.gz
```

#### กู้คืน Collection เฉพาะ
```bash
./scripts/backup-restore.sh restore collection /backup/phone_management/collection_phone_numbers_20241225_120000.tar.gz phone_numbers
```

### การจัดการ Backup

#### ดูรายการ Backup
```bash
./scripts/backup-restore.sh list
```

#### ทำความสะอาด Backup เก่า
```bash
./scripts/backup-restore.sh cleanup
```

#### ตรวจสอบความถูกต้องของ Backup
```bash
./scripts/backup-restore.sh verify /backup/phone_management/full_20241225_120000.tar.gz
```

### การ Export/Import JSON

#### Export ข้อมูลเป็น JSON
```bash
./scripts/backup-restore.sh export phone_numbers
./scripts/backup-restore.sh export notification_logs
```

#### Import ข้อมูลจาก JSON
```bash
./scripts/backup-restore.sh import /backup/phone_management/export_phone_numbers_20241225_120000.json phone_numbers
```

---

## ⏰ การตั้งค่า Cron Jobs อัตโนมัติ

### สำรองข้อมูลอัตโนมัติ

#### สำรองแบบเต็มทุกวัน เวลา 02:00
```bash
./scripts/backup-restore.sh cron-job '0 2 * * *' 'full'
```

#### สำรองแบบเพิ่มหน่วยทุก 6 ชั่วโมง
```bash
./scripts/backup-restore.sh cron-job '0 */6 * * *' 'incremental'
```

### การตรวจสอบและบำรุงรักษาอัตโนมัติ

#### ตรวจสอบสถานะทุกวันเวลา 08:00
```bash
# เพิ่มใน crontab
0 8 * * * docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < /path/to/scripts/monitoring.js >> /var/log/phone_management_monitoring.log 2>&1
```

#### บำรุงรักษาทุกสัปดาห์ วันอาทิตย์ เวลา 03:00
```bash
# เพิ่มใน crontab
0 3 * * 0 docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < /path/to/scripts/maintenance.js >> /var/log/phone_management_maintenance.log 2>&1
```

---

## 📊 การตรวจสอบ Performance

### ตรวจสอบ Slow Queries
```javascript
// เปิด profiling ใน MongoDB
db.setProfilingLevel(2, { slowms: 100 });

// ดู slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

### ตรวจสอบการใช้งาน Index
```javascript
// วิเคราะห์ index usage สำหรับ collection
db.phone_numbers.aggregate([{$indexStats: {}}]);

// อธิบายการทำงานของ query
db.phone_numbers.find({ carrier: "ais" }).explain("executionStats");
```

### ตรวจสอบ Collection Stats
```javascript
// ดูสถิติ collection
db.phone_numbers.stats();

// ตรวจสอบความสมบูรณ์ของข้อมูล
db.phone_numbers.validate();
```

---

## 🚨 การแจ้งเตือนและ Monitoring

### ตั้งค่า Email Alerts (ตัวอย่าง)
```bash
#!/bin/bash
# alert-script.sh

# รัน monitoring script และเช็ค exit code
docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < scripts/monitoring.js > /tmp/monitoring_report.txt

# ส่ง email หากพบปัญหา
if grep -q "❌\|🚨" /tmp/monitoring_report.txt; then
    mail -s "Database Alert - Phone Management System" admin@example.com < /tmp/monitoring_report.txt
fi
```

### Webhook Notifications (ตัวอย่าง)
```bash
#!/bin/bash
# webhook-alert.sh

WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# รัน monitoring และส่งผลไป Slack
REPORT=$(docker exec -i phone_management_mongodb mongosh --username admin --password password123 --authenticationDatabase admin < scripts/monitoring.js)

if echo "$REPORT" | grep -q "❌\|🚨"; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Database Alert: Critical issues found in Phone Management System"}' \
        $WEBHOOK_URL
fi
```

---

## 📋 Best Practices

### การสำรองข้อมูล
- ✅ สำรองข้อมูลแบบเต็มทุกวัน
- ✅ สำรองข้อมูลแบบเพิ่มหน่วยทุก 6 ชั่วโมง
- ✅ ทดสอบการกู้คืนข้อมูลเป็นประจำ
- ✅ เก็บ backup ไว้หลายที่ (local + cloud)

### การบำรุงรักษา
- ✅ รัน maintenance script ทุกสัปดาห์
- ✅ ตรวจสอบ slow queries เป็นประจำ
- ✅ ลบข้อมูลเก่าที่ไม่จำเป็น
- ✅ ตรวจสอบการใช้พื้นที่ disk

### การตรวจสอบ
- ✅ รัน monitoring script ทุกวัน
- ✅ ตั้งค่า alerts สำหรับปัญหาร้ายแรง
- ✅ ตรวจสอบ notification success rate
- ✅ วิเคราะห์ user activity patterns

### ความปลอดภัย
- ✅ ใช้ strong passwords
- ✅ จำกัดสิทธิ์การเข้าถึงฐานข้อมูล
- ✅ Encrypt backup files
- ✅ ตรวจสอบ access logs เป็นประจำ

---

## 🆘 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### "Failed to connect to MongoDB"
```bash
# ตรวจสอบว่า MongoDB รันอยู่
docker ps | grep mongodb

# ตรวจสอบ logs
docker logs phone_management_mongodb

# Restart MongoDB
docker restart phone_management_mongodb
```

#### "Index creation failed"
```bash
# ตรวจสอบ index ที่มีอยู่
db.collection.getIndexes()

# ลบ index ที่ซ้ำ
db.collection.dropIndex("index_name")

# สร้าง index ใหม่
db.collection.createIndex({field: 1})
```

#### "Backup script permission denied"
```bash
# ให้สิทธิ์รัน script
chmod +x scripts/backup-restore.sh

# ตรวจสอบ disk space
df -h
```

#### "Query performance is slow"
```bash
# ตรวจสอบ query plan
db.collection.find().explain("executionStats")

# ตรวจสอบ index usage
db.collection.aggregate([{$indexStats: {}}])

# Reindex collection
db.collection.reIndex()
```

---

## 📞 การติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ logs ก่อน: `docker logs phone_management_mongodb`
2. รัน monitoring script เพื่อดูสถานะ
3. ตรวจสอบ disk space และ memory usage
4. ดู error messages ใน application logs

---

## 📈 การขยายระบบ

เมื่อระบบมีข้อมูลมากขึ้น:

1. **Sharding**: แยกข้อมูลไปหลาย servers
2. **Read Replicas**: สร้าง copy สำหรับ read operations
3. **Archiving**: ย้ายข้อมูลเก่าไป archive storage
4. **Caching**: ใช้ Redis หรือ Memcached
5. **Load Balancing**: กระจาย load ไปหลาย instances