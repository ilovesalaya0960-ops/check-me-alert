// maintenance.js
// MongoDB Maintenance Script for Phone Management System

// Connect to database
db = db.getSiblingDB('phone_management');

print('🔧 Phone Management System - Database Maintenance');
print('Started:', new Date().toISOString());
print('=' .repeat(80));

// Configuration
const NOTIFICATION_LOG_RETENTION_DAYS = 90;  // Keep logs for 90 days
const ARCHIVE_OLD_DATA_DAYS = 365;           // Archive data older than 1 year
const REINDEX_THRESHOLD_SIZE = 1000000;      // Reindex if collection > 1M docs

// ==========================================
// CLEANUP OLD NOTIFICATION LOGS
// ==========================================
print('\n🗑️  CLEANING UP OLD NOTIFICATION LOGS');
print('-'.repeat(50));

try {
    const cutoffDate = new Date(Date.now() - NOTIFICATION_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    print('Removing notification logs older than:', cutoffDate.toISOString());

    // Count old logs before deletion
    const oldLogsCount = db.notification_logs.countDocuments({
        createdAt: { $lt: cutoffDate }
    });

    if (oldLogsCount > 0) {
        // Archive old logs before deletion (optional)
        const archiveResult = db.notification_logs_archive.insertMany(
            db.notification_logs.find({ createdAt: { $lt: cutoffDate } }).toArray()
        );
        print(`📦 Archived ${archiveResult.insertedIds.length} old notification logs`);

        // Delete old logs
        const deleteResult = db.notification_logs.deleteMany({
            createdAt: { $lt: cutoffDate }
        });
        print(`✅ Deleted ${deleteResult.deletedCount} old notification logs`);

        // Calculate space saved
        const spaceSaved = Math.round(deleteResult.deletedCount * 500 / 1024); // Estimate 500 bytes per log
        print(`💾 Estimated space saved: ${spaceSaved} KB`);
    } else {
        print('✅ No old notification logs to clean up');
    }

} catch (e) {
    print('❌ Error cleaning notification logs:', e.message);
}

// ==========================================
// UPDATE EXPIRED PHONE NUMBER STATUSES
// ==========================================
print('\n⚠️  UPDATING EXPIRED PHONE NUMBER STATUSES');
print('-'.repeat(50));

try {
    const now = new Date();

    // Find phones with expired promotions or SIMs
    const expiredPhones = db.phone_numbers.find({
        status: "active",
        $or: [
            { promotionEndDate: { $lt: now } },
            { simExpiryDate: { $lt: now } }
        ]
    }).toArray();

    if (expiredPhones.length > 0) {
        print(`Found ${expiredPhones.length} phones with expired items:`);

        expiredPhones.forEach(phone => {
            const expiredItems = [];
            if (phone.promotionEndDate && phone.promotionEndDate < now) {
                expiredItems.push('promotion');
            }
            if (phone.simExpiryDate && phone.simExpiryDate < now) {
                expiredItems.push('SIM');
            }

            print(`  📱 ${phone.phoneNumber}: Expired ${expiredItems.join(', ')}`);
        });

        // Option 1: Add expired flag instead of changing status
        const updateResult = db.phone_numbers.updateMany(
            {
                status: "active",
                $or: [
                    { promotionEndDate: { $lt: now } },
                    { simExpiryDate: { $lt: now } }
                ]
            },
            {
                $set: {
                    hasExpiredItems: true,
                    lastMaintenanceCheck: now,
                    updatedAt: now
                }
            }
        );

        print(`✅ Updated ${updateResult.modifiedCount} phone records with expired items flag`);

    } else {
        print('✅ No phones with expired items found');
    }

} catch (e) {
    print('❌ Error updating phone statuses:', e.message);
}

// ==========================================
// REINDEX COLLECTIONS
// ==========================================
print('\n📊 REINDEXING LARGE COLLECTIONS');
print('-'.repeat(50));

const collectionsToCheck = [
    'phone_numbers',
    'notification_logs',
    'notification_logs_archive'
];

collectionsToCheck.forEach(collectionName => {
    try {
        const stats = db[collectionName].stats();
        const docCount = stats.count || 0;

        print(`\n🔍 Checking ${collectionName}: ${docCount.toLocaleString()} documents`);

        if (docCount > REINDEX_THRESHOLD_SIZE) {
            print(`  🔄 Reindexing ${collectionName} (large collection)...`);

            const startTime = new Date();
            const result = db[collectionName].reIndex();

            if (result.ok) {
                const duration = new Date() - startTime;
                print(`  ✅ Reindexing completed in ${duration}ms`);
            } else {
                print(`  ❌ Reindexing failed for ${collectionName}`);
            }
        } else {
            print(`  ✅ ${collectionName} size is optimal, skipping reindex`);
        }

    } catch (e) {
        if (e.message.includes('ns not found')) {
            print(`  ℹ️  Collection ${collectionName} does not exist`);
        } else {
            print(`  ❌ Error checking ${collectionName}:`, e.message);
        }
    }
});

// ==========================================
// COMPACT COLLECTIONS
// ==========================================
print('\n💿 COMPACTING COLLECTIONS (Reclaim disk space)');
print('-'.repeat(50));

collectionsToCheck.forEach(collectionName => {
    try {
        const stats = db[collectionName].stats();
        if (!stats) return;

        const storageSize = stats.storageSize || 0;
        const dataSize = stats.size || 0;
        const fragmentation = storageSize > 0 ? ((storageSize - dataSize) / storageSize * 100) : 0;

        print(`\n📊 ${collectionName} fragmentation: ${Math.round(fragmentation)}%`);

        if (fragmentation > 20) {
            print(`  🔄 Compacting ${collectionName} (high fragmentation)...`);

            const startTime = new Date();
            const result = db.runCommand({ compact: collectionName });

            if (result.ok) {
                const duration = new Date() - startTime;
                print(`  ✅ Compaction completed in ${duration}ms`);

                // Get new stats
                const newStats = db[collectionName].stats();
                const spaceSaved = Math.round((storageSize - newStats.storageSize) / 1024 / 1024 * 100) / 100;
                print(`  💾 Space reclaimed: ${spaceSaved} MB`);
            } else {
                print(`  ❌ Compaction failed for ${collectionName}`);
            }
        } else {
            print(`  ✅ ${collectionName} fragmentation is acceptable`);
        }

    } catch (e) {
        if (e.message.includes('ns not found')) {
            print(`  ℹ️  Collection ${collectionName} does not exist`);
        } else {
            print(`  ❌ Error compacting ${collectionName}:`, e.message);
        }
    }
});

// ==========================================
// ANALYZE INDEX USAGE
// ==========================================
print('\n🔍 ANALYZING INDEX USAGE');
print('-'.repeat(50));

const mainCollections = ['phone_numbers', 'notification_logs'];

mainCollections.forEach(collectionName => {
    try {
        print(`\n📊 ${collectionName.toUpperCase()} INDEX ANALYSIS:`);

        const indexStats = db[collectionName].aggregate([{$indexStats: {}}]).toArray();
        const unusedIndexes = [];
        const lowUsageIndexes = [];

        indexStats.forEach(index => {
            const usageCount = index.accesses.ops || 0;
            const indexName = index.name;

            if (indexName === '_id_') return; // Skip default index

            if (usageCount === 0) {
                unusedIndexes.push(indexName);
            } else if (usageCount < 10) {
                lowUsageIndexes.push({ name: indexName, usage: usageCount });
            }
        });

        if (unusedIndexes.length > 0) {
            print('  ⚠️  UNUSED INDEXES (consider removing):');
            unusedIndexes.forEach(indexName => {
                print(`    🗑️  ${indexName}`);
            });
        }

        if (lowUsageIndexes.length > 0) {
            print('  🟡 LOW USAGE INDEXES (review necessity):');
            lowUsageIndexes.forEach(index => {
                print(`    📊 ${index.name}: ${index.usage} uses`);
            });
        }

        if (unusedIndexes.length === 0 && lowUsageIndexes.length === 0) {
            print('  ✅ All indexes are being used effectively');
        }

    } catch (e) {
        print(`  ❌ Error analyzing indexes for ${collectionName}:`, e.message);
    }
});

// ==========================================
// VALIDATE COLLECTIONS
// ==========================================
print('\n✅ VALIDATING COLLECTION INTEGRITY');
print('-'.repeat(50));

mainCollections.forEach(collectionName => {
    try {
        print(`\n🔍 Validating ${collectionName}...`);

        const validation = db[collectionName].validate({ full: false });

        if (validation.valid) {
            print(`  ✅ ${collectionName} is valid`);
            print(`  📊 Documents: ${validation.nrecords.toLocaleString()}`);
            print(`  📊 Indexes: ${validation.nIndexes}`);
        } else {
            print(`  ❌ ${collectionName} validation failed!`);
            if (validation.errors) {
                validation.errors.forEach(error => {
                    print(`    🚨 Error: ${error}`);
                });
            }
        }

    } catch (e) {
        print(`  ❌ Error validating ${collectionName}:`, e.message);
    }
});

// ==========================================
// GENERATE NOTIFICATION SUMMARY
// ==========================================
print('\n📬 NOTIFICATION SYSTEM HEALTH CHECK');
print('-'.repeat(50));

try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Recent notification stats
    const recentNotifications = db.notification_logs.aggregate([
        { $match: { createdAt: { $gte: last24Hours } } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    print('\n📊 NOTIFICATIONS (Last 24 hours):');
    let totalRecent = 0;
    recentNotifications.forEach(stat => {
        totalRecent += stat.count;
        const emoji = stat._id === 'sent' ? '✅' : '❌';
        print(`  ${emoji} ${stat._id}: ${stat.count}`);
    });

    if (totalRecent === 0) {
        print('  ℹ️  No notifications sent in the last 24 hours');
    }

    // Weekly success rate
    const weeklyStats = db.notification_logs.aggregate([
        { $match: { createdAt: { $gte: last7Days } } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    const weeklySuccess = weeklyStats.find(s => s._id === 'sent')?.count || 0;
    const weeklyFailed = weeklyStats.find(s => s._id === 'failed')?.count || 0;
    const weeklyTotal = weeklySuccess + weeklyFailed;

    if (weeklyTotal > 0) {
        const successRate = Math.round(weeklySuccess / weeklyTotal * 100);
        print(`\n📈 WEEKLY SUCCESS RATE: ${successRate}% (${weeklySuccess}/${weeklyTotal})`);

        if (successRate < 90) {
            print('  ⚠️  Low success rate - investigate failed notifications');
        } else {
            print('  ✅ Good notification success rate');
        }
    }

} catch (e) {
    print('❌ Error in notification health check:', e.message);
}

// ==========================================
// UPDATE MAINTENANCE LOG
// ==========================================
print('\n📝 UPDATING MAINTENANCE LOG');
print('-'.repeat(50));

try {
    const maintenanceLog = {
        _id: new ObjectId(),
        timestamp: new Date(),
        type: 'automated_maintenance',
        tasks: [
            'cleanup_old_notification_logs',
            'update_expired_statuses',
            'reindex_large_collections',
            'compact_fragmented_collections',
            'analyze_index_usage',
            'validate_collections',
            'notification_health_check'
        ],
        status: 'completed',
        duration: new Date() - new Date(), // Will be updated
        notes: 'Automated maintenance completed successfully'
    };

    // Create maintenance_logs collection if it doesn't exist
    db.maintenance_logs.insertOne(maintenanceLog);
    print('✅ Maintenance log entry created');

    // Keep only last 30 maintenance logs
    const oldLogs = db.maintenance_logs.find().sort({ timestamp: -1 }).skip(30).toArray();
    if (oldLogs.length > 0) {
        const deleteResult = db.maintenance_logs.deleteMany({
            _id: { $in: oldLogs.map(log => log._id) }
        });
        print(`🗑️  Cleaned up ${deleteResult.deletedCount} old maintenance logs`);
    }

} catch (e) {
    print('❌ Error updating maintenance log:', e.message);
}

// ==========================================
// SUMMARY & RECOMMENDATIONS
// ==========================================
print('\n📋 MAINTENANCE SUMMARY');
print('-'.repeat(50));

try {
    // Get current database stats
    const dbStats = db.stats();
    const totalSize = Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100;

    print('\n📊 POST-MAINTENANCE STATS:');
    print(`  💾 Database size: ${totalSize} MB`);
    print(`  📄 Total documents: ${dbStats.objects.toLocaleString()}`);
    print(`  📊 Collections: ${dbStats.collections}`);
    print(`  💿 Index size: ${Math.round(dbStats.indexSize / 1024 / 1024 * 100) / 100} MB`);

    // Check if any critical issues were found
    const criticalIssues = [];

    // Check for validation failures
    mainCollections.forEach(collectionName => {
        try {
            const validation = db[collectionName].validate({ full: false });
            if (!validation.valid) {
                criticalIssues.push(`${collectionName} validation failed`);
            }
        } catch (e) {
            // Skip if collection doesn't exist
        }
    });

    // Check notification success rate
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyStats = db.notification_logs.aggregate([
        { $match: { createdAt: { $gte: last7Days } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    const weeklySuccess = weeklyStats.find(s => s._id === 'sent')?.count || 0;
    const weeklyFailed = weeklyStats.find(s => s._id === 'failed')?.count || 0;
    const weeklyTotal = weeklySuccess + weeklyFailed;

    if (weeklyTotal > 0 && (weeklySuccess / weeklyTotal) < 0.9) {
        criticalIssues.push('Low notification success rate (<90%)');
    }

    if (criticalIssues.length > 0) {
        print('\n🚨 CRITICAL ISSUES FOUND:');
        criticalIssues.forEach(issue => {
            print(`  ❌ ${issue}`);
        });
    } else {
        print('\n✅ NO CRITICAL ISSUES FOUND');
    }

    print('\n💡 NEXT RECOMMENDED ACTIONS:');
    print('  1. Monitor application logs for any errors');
    print('  2. Review notification failure reasons if any');
    print('  3. Schedule next maintenance in 1 week');
    print('  4. Consider database backup if not automated');

} catch (e) {
    print('❌ Error generating summary:', e.message);
}

// ==========================================
// FOOTER
// ==========================================
print('\n' + '='.repeat(80));
print('🔧 Maintenance completed at:', new Date().toISOString());
print('📅 Next maintenance recommended: Weekly');
print('📞 Contact system administrator if critical issues found');
print('='.repeat(80));