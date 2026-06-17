#!/bin/bash
# Backup DestinyServicesTI
BACKUP_DIR="/backups/db"
DB_URL="postgresql://user:password@hostname:5432/dbname"
FILENAME="$BACKUP_DIR/backup-$(date +%F_%H%M%S).sql"

# Garante que a pasta existe
mkdir -p $BACKUP_DIR

# Executa o dump
pg_dump $DB_URL > $FILENAME

# Remove backups com mais de 15 dias para economizar espaço
find $BACKUP_DIR -type f -mtime +15 -delete

echo "Backup do banco concluído com sucesso em $FILENAME"
