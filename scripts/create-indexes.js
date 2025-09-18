// create-indexes.js
// MongoDB Index Creation Script for Phone Management System

// Connect to database
db = db.getSiblingDB('phone_management');

print('🚀 Starting index creation for phone_management database...');

// ==========================================
// PHONE_NUMBERS COLLECTION INDEXES
// ==========================================
print('\n📱 Creating indexes for phone_numbers collection...');

// Primary unique index
try {
  db.phone_numbers.createIndex({ "phoneNumber": 1 }, { unique: true });
  print('✅ Created unique index on phoneNumber');
} catch (e) {
  print('⚠️  phoneNumber index already exists or error:', e.message);
}

// Performance indexes
const phoneNumberIndexes = [
  { "carrier": 1 },
  { "category": 1 },
  { "status": 1 },
  { "createdAt": -1 },
  { "updatedAt": -1 },
  { "promotionEndDate": 1 },
  { "simExpiryDate": 1 },
  { "lastNotified": 1 }
];

phoneNumberIndexes.forEach(index => {
  try {
    db.phone_numbers.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

// Compound indexes for better query performance
const phoneNumberCompoundIndexes = [
  { "carrier": 1, "status": 1 },
  { "category": 1, "status": 1 },
  { "promotionEndDate": 1, "status": 1 },
  { "simExpiryDate": 1, "status": 1 },
  { "carrier": 1, "promotionEndDate": 1 },
  { "createdAt": -1, "status": 1 }
];

phoneNumberCompoundIndexes.forEach(index => {
  try {
    db.phone_numbers.createIndex(index);
    print('✅ Created compound index on', Object.keys(index).join(', '));
  } catch (e) {
    print('⚠️  Compound index already exists or error:', e.message);
  }
});

// Text search index
try {
  db.phone_numbers.createIndex({
    "phoneNumber": "text",
    "notes": "text",
    "promotion": "text"
  }, {
    name: "phone_numbers_text_search",
    weights: {
      "phoneNumber": 10,
      "promotion": 5,
      "notes": 1
    }
  });
  print('✅ Created text search index');
} catch (e) {
  print('⚠️  Text search index already exists or error:', e.message);
}

// ==========================================
// NOTIFICATION_LOGS COLLECTION INDEXES
// ==========================================
print('\n🔔 Creating indexes for notification_logs collection...');

const notificationIndexes = [
  { "phoneNumberId": 1 },
  { "notificationType": 1 },
  { "status": 1 },
  { "createdAt": -1 },
  { "sentAt": -1 },
  { "scheduledAt": 1 }
];

notificationIndexes.forEach(index => {
  try {
    db.notification_logs.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

// Compound indexes
const notificationCompoundIndexes = [
  { "phoneNumberId": 1, "createdAt": -1 },
  { "notificationType": 1, "status": 1 },
  { "status": 1, "scheduledAt": 1 }
];

notificationCompoundIndexes.forEach(index => {
  try {
    db.notification_logs.createIndex(index);
    print('✅ Created compound index on', Object.keys(index).join(', '));
  } catch (e) {
    print('⚠️  Compound index already exists or error:', e.message);
  }
});

// ==========================================
// TELEGRAM_SETTINGS COLLECTION INDEXES
// ==========================================
print('\n📞 Creating indexes for telegram_settings collection...');

const telegramIndexes = [
  { "isEnabled": 1 },
  { "lastDailyReport": -1 },
  { "updatedAt": -1 }
];

telegramIndexes.forEach(index => {
  try {
    db.telegram_settings.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

// ==========================================
// USERS COLLECTION INDEXES (Future)
// ==========================================
print('\n👤 Creating indexes for users collection...');

const userIndexes = [
  { "username": 1 },
  { "email": 1 },
  { "isActive": 1 },
  { "role": 1 },
  { "lastLogin": -1 },
  { "createdAt": -1 }
];

userIndexes.forEach(index => {
  try {
    db.users.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

// Unique indexes for users
try {
  db.users.createIndex({ "username": 1 }, { unique: true });
  print('✅ Created unique index on username');
} catch (e) {
  print('⚠️  Username unique index already exists or error:', e.message);
}

try {
  db.users.createIndex({ "email": 1 }, { unique: true });
  print('✅ Created unique index on email');
} catch (e) {
  print('⚠️  Email unique index already exists or error:', e.message);
}

// ==========================================
// CATEGORIES COLLECTION INDEXES
// ==========================================
print('\n📂 Creating indexes for categories collection...');

const categoryIndexes = [
  { "name": 1 },
  { "isActive": 1 },
  { "sortOrder": 1 }
];

categoryIndexes.forEach(index => {
  try {
    db.categories.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

// ==========================================
// CARRIERS COLLECTION INDEXES
// ==========================================
print('\n📡 Creating indexes for carriers collection...');

const carrierIndexes = [
  { "code": 1 },
  { "name": 1 },
  { "isActive": 1 }
];

carrierIndexes.forEach(index => {
  try {
    db.carriers.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

try {
  db.carriers.createIndex({ "code": 1 }, { unique: true });
  print('✅ Created unique index on carrier code');
} catch (e) {
  print('⚠️  Carrier code unique index already exists or error:', e.message);
}

// ==========================================
// PROMOTIONS COLLECTION INDEXES
// ==========================================
print('\n🎯 Creating indexes for promotions collection...');

const promotionIndexes = [
  { "name": 1 },
  { "carrierId": 1 },
  { "isActive": 1 },
  { "startDate": 1 },
  { "endDate": 1 },
  { "price": 1 }
];

promotionIndexes.forEach(index => {
  try {
    db.promotions.createIndex(index);
    print('✅ Created index on', Object.keys(index)[0]);
  } catch (e) {
    print('⚠️  Index already exists or error:', e.message);
  }
});

// Compound indexes for promotions
const promotionCompoundIndexes = [
  { "carrierId": 1, "isActive": 1 },
  { "isActive": 1, "startDate": 1, "endDate": 1 }
];

promotionCompoundIndexes.forEach(index => {
  try {
    db.promotions.createIndex(index);
    print('✅ Created compound index on', Object.keys(index).join(', '));
  } catch (e) {
    print('⚠️  Compound index already exists or error:', e.message);
  }
});

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
print('\n📊 Index creation summary:');

const collections = [
  'phone_numbers',
  'notification_logs',
  'telegram_settings',
  'users',
  'categories',
  'carriers',
  'promotions'
];

collections.forEach(collectionName => {
  try {
    const stats = db[collectionName].getIndexes();
    print(`📋 ${collectionName}: ${stats.length} indexes created`);
  } catch (e) {
    print(`⚠️  Could not get stats for ${collectionName}:`, e.message);
  }
});

print('\n🎉 Index creation completed!');

// Tips for monitoring
print('\n💡 Performance Tips:');
print('- Monitor slow queries with: db.setProfilingLevel(2, { slowms: 100 })');
print('- Check index usage with: db.collection.aggregate([{$indexStats:{}}])');
print('- Analyze query performance with: db.collection.find().explain("executionStats")');
print('- Regular maintenance: db.runCommand({reIndex: "collection_name"})');

print('\n📝 Next steps:');
print('1. Run migration scripts to populate initial data');
print('2. Set up monitoring for query performance');
print('3. Configure backup strategy');
print('4. Implement data archiving for old logs');