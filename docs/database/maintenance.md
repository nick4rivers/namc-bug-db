---
title: Database Maintenance
---

## Backup

```bash
pg_dump --file="<backup_file>.tar" \
  --dbname=bugdb \
  --format=t \
  --host=192.168.0.3 \
  --username=bugdb_user
```

## Restore


```bash
pg_restore ./<backup_file.tar> \
  --host=localhost \
  --port=1112 \
  --username=bugdb_root \
  --dbname=bugdb \
  --no-owner \
  --no-privileges \
  2>&1 | <log_file.log>
```