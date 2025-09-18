#!/bin/bash

# backup-restore.sh
# MongoDB Backup and Restore Script for Phone Management System

# Configuration
DB_NAME="phone_management"
BACKUP_DIR="/backup/phone_management"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# Full database backup
backup_full() {
    log "Starting full backup of database: $DB_NAME"

    local backup_path="${BACKUP_DIR}/full_${DATE}"

    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        error "MongoDB is not running"
        exit 1
    fi

    # Perform backup
    if mongodump --db "$DB_NAME" --out "$backup_path" --quiet; then
        success "Full backup completed: $backup_path"

        # Compress backup
        tar -czf "${backup_path}.tar.gz" -C "$backup_path" .
        rm -rf "$backup_path"
        success "Backup compressed: ${backup_path}.tar.gz"

        # Calculate size
        local size=$(du -h "${backup_path}.tar.gz" | cut -f1)
        log "Backup size: $size"

        return 0
    else
        error "Full backup failed"
        return 1
    fi
}

# Incremental backup using oplog
backup_incremental() {
    log "Starting incremental backup using oplog"

    local backup_path="${BACKUP_DIR}/incremental_${DATE}"

    # Check if this is the first incremental backup
    local last_backup_file="${BACKUP_DIR}/last_incremental.timestamp"
    local since_timestamp=""

    if [ -f "$last_backup_file" ]; then
        since_timestamp=$(cat "$last_backup_file")
        log "Incremental backup since: $since_timestamp"
    else
        warning "No previous incremental backup found, performing full oplog backup"
    fi

    # Perform incremental backup
    if mongodump --db "$DB_NAME" --oplog --out "$backup_path" --quiet; then
        success "Incremental backup completed: $backup_path"

        # Save current timestamp for next incremental backup
        date +%s > "$last_backup_file"

        # Compress backup
        tar -czf "${backup_path}.tar.gz" -C "$backup_path" .
        rm -rf "$backup_path"
        success "Incremental backup compressed: ${backup_path}.tar.gz"

        return 0
    else
        error "Incremental backup failed"
        return 1
    fi
}

# Collection-specific backup
backup_collection() {
    local collection=$1

    if [ -z "$collection" ]; then
        error "Collection name required"
        return 1
    fi

    log "Starting backup of collection: $collection"

    local backup_path="${BACKUP_DIR}/collection_${collection}_${DATE}"

    if mongodump --db "$DB_NAME" --collection "$collection" --out "$backup_path" --quiet; then
        success "Collection backup completed: $backup_path"

        # Compress backup
        tar -czf "${backup_path}.tar.gz" -C "$backup_path" .
        rm -rf "$backup_path"
        success "Collection backup compressed: ${backup_path}.tar.gz"

        return 0
    else
        error "Collection backup failed"
        return 1
    fi
}

# Restore from backup
restore_full() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        error "Backup file path required"
        return 1
    fi

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    log "Starting restore from: $backup_file"

    # Extract backup if it's compressed
    local extract_dir="/tmp/restore_${DATE}"
    mkdir -p "$extract_dir"

    if [[ "$backup_file" == *.tar.gz ]]; then
        tar -xzf "$backup_file" -C "$extract_dir"
        backup_file="$extract_dir"
    fi

    # Warning before restore
    warning "This will REPLACE the current database. Continue? (y/N)"
    read -r confirm

    if [[ $confirm != [yY] ]]; then
        log "Restore cancelled"
        rm -rf "$extract_dir"
        return 1
    fi

    # Perform restore
    if mongorestore --db "$DB_NAME" --drop "$backup_file/$DB_NAME" --quiet; then
        success "Database restored successfully"
        rm -rf "$extract_dir"
        return 0
    else
        error "Restore failed"
        rm -rf "$extract_dir"
        return 1
    fi
}

# Restore specific collection
restore_collection() {
    local backup_file=$1
    local collection=$2

    if [ -z "$backup_file" ] || [ -z "$collection" ]; then
        error "Backup file and collection name required"
        return 1
    fi

    log "Restoring collection $collection from: $backup_file"

    # Extract backup if compressed
    local extract_dir="/tmp/restore_collection_${DATE}"
    mkdir -p "$extract_dir"

    if [[ "$backup_file" == *.tar.gz ]]; then
        tar -xzf "$backup_file" -C "$extract_dir"
        backup_file="$extract_dir"
    fi

    if mongorestore --db "$DB_NAME" --collection "$collection" --drop "$backup_file/$DB_NAME/$collection.bson" --quiet; then
        success "Collection $collection restored successfully"
        rm -rf "$extract_dir"
        return 0
    else
        error "Collection restore failed"
        rm -rf "$extract_dir"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days"

    local deleted_count=0

    # Find and delete old backups
    if [ -d "$BACKUP_DIR" ]; then
        while IFS= read -r -d '' file; do
            rm -f "$file"
            ((deleted_count++))
        done < <(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -print0)

        success "Cleaned up $deleted_count old backup files"
    else
        warning "Backup directory not found: $BACKUP_DIR"
    fi
}

# List available backups
list_backups() {
    log "Available backups in $BACKUP_DIR:"

    if [ ! -d "$BACKUP_DIR" ]; then
        warning "Backup directory not found"
        return 1
    fi

    echo ""
    echo "📁 Full Backups:"
    find "$BACKUP_DIR" -name "full_*.tar.gz" -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'

    echo ""
    echo "🔄 Incremental Backups:"
    find "$BACKUP_DIR" -name "incremental_*.tar.gz" -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'

    echo ""
    echo "📋 Collection Backups:"
    find "$BACKUP_DIR" -name "collection_*.tar.gz" -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        error "Backup file required"
        return 1
    fi

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    log "Verifying backup integrity: $backup_file"

    # Check if file is a valid tar.gz
    if [[ "$backup_file" == *.tar.gz ]]; then
        if tar -tzf "$backup_file" > /dev/null 2>&1; then
            success "Backup file is valid"

            # List contents
            echo ""
            echo "📋 Backup contents:"
            tar -tzf "$backup_file" | head -20

            local file_count=$(tar -tzf "$backup_file" | wc -l)
            log "Total files in backup: $file_count"

            return 0
        else
            error "Backup file is corrupted"
            return 1
        fi
    else
        error "Backup file format not supported"
        return 1
    fi
}

# Create automated backup script
create_cron_job() {
    local schedule=$1
    local backup_type=$2

    if [ -z "$schedule" ] || [ -z "$backup_type" ]; then
        error "Schedule and backup type required"
        echo "Usage: $0 cron-job '<schedule>' '<full|incremental>'"
        echo "Example: $0 cron-job '0 2 * * *' 'full'  # Daily at 2 AM"
        return 1
    fi

    local script_path=$(realpath "$0")
    local cron_command="$script_path backup $backup_type"
    local cron_entry="$schedule $cron_command"

    log "Creating cron job: $cron_entry"

    # Add to crontab
    (crontab -l 2>/dev/null; echo "$cron_entry") | sort -u | crontab -

    success "Cron job created successfully"
    log "Current crontab:"
    crontab -l
}

# Export database to JSON
export_json() {
    local collection=$1
    local output_file="${BACKUP_DIR}/export_${collection}_${DATE}.json"

    if [ -z "$collection" ]; then
        error "Collection name required"
        return 1
    fi

    log "Exporting collection $collection to JSON: $output_file"

    if mongoexport --db "$DB_NAME" --collection "$collection" --out "$output_file" --jsonArray --pretty; then
        success "JSON export completed: $output_file"

        local size=$(du -h "$output_file" | cut -f1)
        log "Export size: $size"

        return 0
    else
        error "JSON export failed"
        return 1
    fi
}

# Import from JSON
import_json() {
    local json_file=$1
    local collection=$2

    if [ -z "$json_file" ] || [ -z "$collection" ]; then
        error "JSON file and collection name required"
        return 1
    fi

    if [ ! -f "$json_file" ]; then
        error "JSON file not found: $json_file"
        return 1
    fi

    log "Importing JSON file to collection $collection: $json_file"

    if mongoimport --db "$DB_NAME" --collection "$collection" --file "$json_file" --jsonArray --drop; then
        success "JSON import completed"
        return 0
    else
        error "JSON import failed"
        return 1
    fi
}

# Main function
main() {
    case $1 in
        "backup")
            create_backup_dir
            case $2 in
                "full")
                    backup_full
                    ;;
                "incremental")
                    backup_incremental
                    ;;
                "collection")
                    backup_collection "$3"
                    ;;
                *)
                    echo "Usage: $0 backup <full|incremental|collection> [collection_name]"
                    exit 1
                    ;;
            esac
            ;;
        "restore")
            case $2 in
                "full")
                    restore_full "$3"
                    ;;
                "collection")
                    restore_collection "$3" "$4"
                    ;;
                *)
                    echo "Usage: $0 restore <full|collection> <backup_file> [collection_name]"
                    exit 1
                    ;;
            esac
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "cron-job")
            create_cron_job "$2" "$3"
            ;;
        "export")
            create_backup_dir
            export_json "$2"
            ;;
        "import")
            import_json "$2" "$3"
            ;;
        *)
            echo "📱 Phone Management System - Backup & Restore Tool"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  backup full                              - Create full database backup"
            echo "  backup incremental                       - Create incremental backup"
            echo "  backup collection <name>                 - Backup specific collection"
            echo "  restore full <backup_file>               - Restore full database"
            echo "  restore collection <backup_file> <name>  - Restore specific collection"
            echo "  list                                     - List available backups"
            echo "  cleanup                                  - Remove old backups"
            echo "  verify <backup_file>                     - Verify backup integrity"
            echo "  export <collection>                      - Export collection to JSON"
            echo "  import <json_file> <collection>          - Import JSON to collection"
            echo "  cron-job '<schedule>' '<type>'           - Create automated backup job"
            echo ""
            echo "Examples:"
            echo "  $0 backup full"
            echo "  $0 backup collection phone_numbers"
            echo "  $0 restore full /backup/phone_management/full_20241225_120000.tar.gz"
            echo "  $0 cron-job '0 2 * * *' 'full'"
            echo "  $0 export phone_numbers"
            echo ""
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"