#!/bin/bash
# ==============================================================================
# QuizLive — Automated Database Backup Script
# ==============================================================================
# Performs a compressed, timestamped mysqldump of the enterprise_quizapp
# database and enforces a 7-day retention policy on backup files.
#
# Prerequisites:
#   - Create /home/quizlive-db/.my.cnf with credentials (see section below)
#   - Set permissions: chmod 600 /home/quizlive-db/.my.cnf
#
# Recommended cron schedule (daily at 02:00):
#   0 2 * * * /home/quizlive-db/scripts/backup-db.sh >> /home/quizlive-db/backups/backup.log 2>&1
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------------------
DB_NAME="enterprise_quizapp"
BACKUP_DIR="/home/quizlive-db/backups/database"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SQL_FILE="$BACKUP_DIR/$DB_NAME-$TIMESTAMP.sql"
GZ_FILE="$SQL_FILE.gz"
LOG_PREFIX="[$(date +"%Y-%m-%d %H:%M:%S")]"

# Credentials are read from ~/.my.cnf — NOT hardcoded here.
# Create the file once:
#
#   /home/quizlive-db/.my.cnf
#   -------------------------
#   [mysqldump]
#   user     = quiz_api_worker
#   password = CompEng!QuizSecured@2026
#   host     = localhost
#
#   [client]
#   user     = quiz_api_worker
#   password = CompEng!QuizSecured@2026
#   host     = localhost
#
# Then lock down permissions:
#   chmod 600 /home/quizlive-db/.my.cnf

# ------------------------------------------------------------------------------
# 1. Ensure backup directory exists
# ------------------------------------------------------------------------------
mkdir -p "$BACKUP_DIR"

# ------------------------------------------------------------------------------
# 2. Execute database dump
# ------------------------------------------------------------------------------
echo "$LOG_PREFIX Starting database backup: $DB_NAME → $SQL_FILE"

if ! mysqldump "$DB_NAME" > "$SQL_FILE"; then
    echo "$LOG_PREFIX ERROR: mysqldump failed. Removing incomplete file."
    rm -f "$SQL_FILE"
    exit 1
fi

echo "$LOG_PREFIX mysqldump completed successfully."

# ------------------------------------------------------------------------------
# 3. Compress dump file
# ------------------------------------------------------------------------------
if ! gzip "$SQL_FILE"; then
    echo "$LOG_PREFIX ERROR: gzip compression failed. Uncompressed dump retained at: $SQL_FILE"
    exit 1
fi

echo "$LOG_PREFIX Backup compressed successfully: $GZ_FILE"
echo "$LOG_PREFIX Compressed size: $(du -sh "$GZ_FILE" | cut -f1)"

# ------------------------------------------------------------------------------
# 4. Backup rotation — remove files older than 7 days
# ------------------------------------------------------------------------------
echo "$LOG_PREFIX Running retention policy: removing backups older than 7 days..."
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +7 -delete
echo "$LOG_PREFIX Retention policy applied. Current backup count: $(find "$BACKUP_DIR" -name "*.gz" | wc -l) file(s)."

echo "------------------------------------------------------------------------------"
echo "$LOG_PREFIX Backup job completed successfully."
echo "------------------------------------------------------------------------------"