#!/bin/bash

# Database backup script for Si-Kancil Development
BACKUP_DIR="/opt/sikancil/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sikancil_dev_$DATE.sql"

mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump sikancil_dev > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
