// monitoring.js
// MongoDB Performance Monitoring Script for Phone Management System

// Connect to database
db = db.getSiblingDB('phone_management');

print('📊 Phone Management System - Database Monitoring Report');
print('Generated:', new Date().toISOString());
print('=' .repeat(80));

// ==========================================
// DATABASE STATISTICS
// ==========================================
print('\n📈 DATABASE OVERVIEW');
print('-'.repeat(40));

try {
    const dbStats = db.stats();
    print('📦 Database:', db.getName());
    print('💾 Data Size:', Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100, 'MB');
    print('🗂️  Storage Size:', Math.round(dbStats.storageSize / 1024 / 1024 * 100) / 100, 'MB');
    print('📄 Collections:', dbStats.collections);
    print('📋 Objects:', dbStats.objects.toLocaleString());
    print('📊 Indexes:', dbStats.indexes);
    print('💿 Index Size:', Math.round(dbStats.indexSize / 1024 / 1024 * 100) / 100, 'MB');
} catch (e) {
    print('❌ Error getting database stats:', e.message);
}

// ==========================================
// COLLECTION STATISTICS
// ==========================================
print('\n📚 COLLECTION STATISTICS');
print('-'.repeat(40));

const collections = [
    'phone_numbers',
    'notification_logs',
    'telegram_settings',
    'carriers',
    'categories',
    'promotions'
];

collections.forEach(collectionName => {
    try {
        const stats = db[collectionName].stats();
        print(`\n📋 ${collectionName.toUpperCase()}`);
        print('  📄 Documents:', stats.count.toLocaleString());
        print('  💾 Size:', Math.round(stats.size / 1024 * 100) / 100, 'KB');
        print('  🗂️  Storage Size:', Math.round(stats.storageSize / 1024 * 100) / 100, 'KB');
        print('  📊 Indexes:', stats.nindexes);
        print('  💿 Index Size:', Math.round(stats.totalIndexSize / 1024 * 100) / 100, 'KB');
        print('  📏 Avg Doc Size:', Math.round(stats.avgObjSize || 0), 'bytes');
    } catch (e) {
        print(`❌ Error getting stats for ${collectionName}:`, e.message);
    }
});

// ==========================================
// INDEX USAGE ANALYSIS
// ==========================================
print('\n🔍 INDEX USAGE ANALYSIS');
print('-'.repeat(40));

collections.forEach(collectionName => {
    try {
        const indexStats = db[collectionName].aggregate([{$indexStats: {}}]).toArray();

        print(`\n📊 ${collectionName.toUpperCase()} INDEX USAGE:`);

        indexStats.forEach(index => {
            const usageCount = index.accesses.ops || 0;
            const usageStatus = usageCount === 0 ? '⚠️  UNUSED' :
                               usageCount < 10 ? '🟡 LOW' :
                               usageCount < 100 ? '🟢 NORMAL' : '🔥 HIGH';

            print(`  ${usageStatus} ${index.name}: ${usageCount} accesses`);
        });
    } catch (e) {
        print(`❌ Error getting index stats for ${collectionName}:`, e.message);
    }
});

// ==========================================
// DATA HEALTH CHECK
// ==========================================
print('\n🏥 DATA HEALTH CHECK');
print('-'.repeat(40));

try {
    // Phone numbers health
    const totalPhones = db.phone_numbers.countDocuments();
    const activePhones = db.phone_numbers.countDocuments({ status: "active" });
    const expiredPhones = db.phone_numbers.countDocuments({
        $or: [
            { promotionEndDate: { $lt: new Date() } },
            { simExpiryDate: { $lt: new Date() } }
        ]
    });

    print('\n📱 PHONE NUMBERS HEALTH:');
    print('  📊 Total:', totalPhones.toLocaleString());
    print('  ✅ Active:', activePhones.toLocaleString(), `(${Math.round(activePhones/totalPhones*100)}%)`);
    print('  ⚠️  Expired:', expiredPhones.toLocaleString(), `(${Math.round(expiredPhones/totalPhones*100)}%)`);

    // Notification health
    const totalNotifications = db.notification_logs.countDocuments();
    const successfulNotifications = db.notification_logs.countDocuments({ status: "sent" });
    const failedNotifications = db.notification_logs.countDocuments({ status: "failed" });

    if (totalNotifications > 0) {
        print('\n🔔 NOTIFICATION HEALTH:');
        print('  📊 Total:', totalNotifications.toLocaleString());
        print('  ✅ Successful:', successfulNotifications.toLocaleString(),
              `(${Math.round(successfulNotifications/totalNotifications*100)}%)`);
        print('  ❌ Failed:', failedNotifications.toLocaleString(),
              `(${Math.round(failedNotifications/totalNotifications*100)}%)`);
    }

    // Carrier distribution
    print('\n📡 CARRIER DISTRIBUTION:');
    const carrierStats = db.phone_numbers.aggregate([
        { $group: { _id: "$carrier", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray();

    carrierStats.forEach(stat => {
        const percentage = Math.round(stat.count / totalPhones * 100);
        print(`  📊 ${stat._id.toUpperCase()}: ${stat.count} (${percentage}%)`);
    });

} catch (e) {
    print('❌ Error in health check:', e.message);
}

// ==========================================
// EXPIRY ANALYSIS
// ==========================================
print('\n⏰ EXPIRY ANALYSIS');
print('-'.repeat(40));

try {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Promotion expiry
    const promoExpiredCount = db.phone_numbers.countDocuments({
        promotionEndDate: { $lt: now }
    });
    const promoExpiring7Days = db.phone_numbers.countDocuments({
        promotionEndDate: { $gte: now, $lte: oneWeek }
    });
    const promoExpiring30Days = db.phone_numbers.countDocuments({
        promotionEndDate: { $gte: now, $lte: oneMonth }
    });

    print('\n🎯 PROMOTION EXPIRY:');
    print('  ❌ Already Expired:', promoExpiredCount);
    print('  ⚠️  Expiring in 7 days:', promoExpiring7Days);
    print('  🟡 Expiring in 30 days:', promoExpiring30Days);

    // SIM expiry
    const simExpiredCount = db.phone_numbers.countDocuments({
        simExpiryDate: { $lt: now }
    });
    const simExpiring7Days = db.phone_numbers.countDocuments({
        simExpiryDate: { $gte: now, $lte: oneWeek }
    });
    const simExpiring30Days = db.phone_numbers.countDocuments({
        simExpiryDate: { $gte: now, $lte: oneMonth }
    });

    print('\n📱 SIM EXPIRY:');
    print('  ❌ Already Expired:', simExpiredCount);
    print('  ⚠️  Expiring in 7 days:', simExpiring7Days);
    print('  🟡 Expiring in 30 days:', simExpiring30Days);

} catch (e) {
    print('❌ Error in expiry analysis:', e.message);
}

// ==========================================
// PERFORMANCE METRICS
// ==========================================
print('\n⚡ PERFORMANCE METRICS');
print('-'.repeat(40));

try {
    // Query performance check
    const sampleQueries = [
        {
            name: 'Find by phone number',
            query: () => db.phone_numbers.find({ phoneNumber: "081-234-5678" }).explain("executionStats")
        },
        {
            name: 'Find by carrier',
            query: () => db.phone_numbers.find({ carrier: "ais" }).explain("executionStats")
        },
        {
            name: 'Find expiring promotions',
            query: () => db.phone_numbers.find({
                promotionEndDate: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 7*24*60*60*1000)
                }
            }).explain("executionStats")
        }
    ];

    print('\n🔍 QUERY PERFORMANCE:');
    sampleQueries.forEach(test => {
        try {
            const result = test.query();
            const stats = result.executionStats;
            const executionTime = stats.executionTimeMillis;
            const docsExamined = stats.totalDocsExamined;
            const docsReturned = stats.totalDocsReturned;

            const efficiency = docsReturned === 0 ? 0 : Math.round((docsReturned / docsExamined) * 100);
            const status = executionTime < 100 ? '🟢 FAST' :
                          executionTime < 1000 ? '🟡 OK' : '🔴 SLOW';

            print(`  ${status} ${test.name}:`);
            print(`    ⏱️  Execution time: ${executionTime}ms`);
            print(`    📄 Docs examined: ${docsExamined}`);
            print(`    📋 Docs returned: ${docsReturned}`);
            print(`    📊 Efficiency: ${efficiency}%`);

        } catch (e) {
            print(`  ❌ Error testing ${test.name}:`, e.message);
        }
    });

} catch (e) {
    print('❌ Error in performance metrics:', e.message);
}

// ==========================================
// RECENT ACTIVITY
// ==========================================
print('\n📈 RECENT ACTIVITY (Last 24 hours)');
print('-'.repeat(40));

try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // New phone numbers
    const newPhones = db.phone_numbers.countDocuments({
        createdAt: { $gte: yesterday }
    });

    // Recent notifications
    const recentNotifications = db.notification_logs.countDocuments({
        createdAt: { $gte: yesterday }
    });

    // Recent updates
    const recentUpdates = db.phone_numbers.countDocuments({
        updatedAt: { $gte: yesterday },
        createdAt: { $lt: yesterday }
    });

    print('\n📊 ACTIVITY SUMMARY:');
    print('  📱 New phone numbers:', newPhones);
    print('  🔔 Notifications sent:', recentNotifications);
    print('  ✏️  Records updated:', recentUpdates);

    // Most active collections
    print('\n🔥 MOST ACTIVE COLLECTIONS:');
    const activityData = [
        { name: 'phone_numbers', count: newPhones + recentUpdates },
        { name: 'notification_logs', count: recentNotifications }
    ].sort((a, b) => b.count - a.count);

    activityData.forEach(item => {
        if (item.count > 0) {
            print(`  📈 ${item.name}: ${item.count} activities`);
        }
    });

} catch (e) {
    print('❌ Error in recent activity analysis:', e.message);
}

// ==========================================
// RECOMMENDATIONS
// ==========================================
print('\n💡 RECOMMENDATIONS');
print('-'.repeat(40));

try {
    const recommendations = [];

    // Check for unused indexes
    collections.forEach(collectionName => {
        try {
            const indexStats = db[collectionName].aggregate([{$indexStats: {}}]).toArray();
            const unusedIndexes = indexStats.filter(index =>
                index.name !== '_id_' && (index.accesses.ops || 0) === 0
            );

            if (unusedIndexes.length > 0) {
                recommendations.push(`🗑️  Consider removing unused indexes in ${collectionName}: ${unusedIndexes.map(i => i.name).join(', ')}`);
            }
        } catch (e) {
            // Skip if collection doesn't exist
        }
    });

    // Check for large collections
    const phoneCount = db.phone_numbers.countDocuments();
    if (phoneCount > 10000) {
        recommendations.push('📊 Consider implementing data archiving for phone_numbers collection');
    }

    const logCount = db.notification_logs.countDocuments();
    if (logCount > 50000) {
        recommendations.push('🗂️  Consider archiving old notification logs (older than 1 year)');
    }

    // Check for expired records
    const expiredCount = db.phone_numbers.countDocuments({
        $or: [
            { promotionEndDate: { $lt: new Date(Date.now() - 30*24*60*60*1000) } },
            { simExpiryDate: { $lt: new Date(Date.now() - 30*24*60*60*1000) } }
        ]
    });

    if (expiredCount > 0) {
        recommendations.push(`⚠️  ${expiredCount} phone numbers have expired items - consider cleanup or status update`);
    }

    // Performance recommendations
    if (phoneCount > 1000) {
        recommendations.push('🚀 Consider enabling MongoDB profiling to monitor slow queries');
        recommendations.push('💾 Consider implementing read replicas for better read performance');
    }

    if (recommendations.length === 0) {
        print('\n✅ No immediate recommendations - database looks healthy!');
    } else {
        print('\n📋 Recommendations:');
        recommendations.forEach((rec, index) => {
            print(`  ${index + 1}. ${rec}`);
        });
    }

} catch (e) {
    print('❌ Error generating recommendations:', e.message);
}

// ==========================================
// MAINTENANCE TASKS
// ==========================================
print('\n🔧 SUGGESTED MAINTENANCE TASKS');
print('-'.repeat(40));

print('\n📅 DAILY:');
print('  - Monitor notification success rates');
print('  - Check for system errors in logs');
print('  - Verify backup completion');

print('\n📅 WEEKLY:');
print('  - Review index usage statistics');
print('  - Clean up old notification logs (>30 days)');
print('  - Monitor database growth trends');

print('\n📅 MONTHLY:');
print('  - Reindex collections for optimal performance');
print('  - Archive old data (>6 months)');
print('  - Review and optimize slow queries');
print('  - Update expired phone number statuses');

print('\n📅 QUARTERLY:');
print('  - Full database backup and restore test');
print('  - Performance benchmarking');
print('  - Security audit');
print('  - Capacity planning review');

// ==========================================
// FOOTER
// ==========================================
print('\n' + '='.repeat(80));
print('📊 Report completed at:', new Date().toISOString());
print('🔧 Run this script regularly to monitor database health');
print('📝 For automated monitoring, consider setting up MongoDB Compass or similar tools');
print('🚨 Set up alerts for critical metrics like disk space, query performance, and error rates');
print('='.repeat(80));