# Database Synchronization Documentation

## Overview
This document explains the database synchronization process between development and production environments for the BuildAppsWith platform.

## Key Principles
1. **Development and Production are SEPARATE databases** (not branches)
2. **Production uses `liam@buildappswith.com`** (NOT .ai)
3. **Always backup before making changes**
4. **Verify at each step**

## Database Structure
- **Development**: `Buildappswith-dev`
- **Production**: `Buildappswith-prod`
- **Provider**: Neon PostgreSQL

## Synchronization Scripts

### 1. Verify Database Connection
```bash
node scripts/verify-database-connection.js
```
- Checks current database connection
- Shows database type (dev/prod)
- Displays user counts and builder profiles

### 2. Backup Production
```bash
node scripts/backup-production-raw.js
```
- Creates timestamped backup of production data
- Saves to `backups/production/[timestamp]/`
- Exports both data and schema

### 3. Sync Schema to Production
```bash
node scripts/sync-schema-to-production.js
```
- Applies development schema to production
- Handles field renames (e.g., `imageUrl` → `image`)
- Preserves existing data

### 4. Copy Data to Production
```bash
node scripts/copy-dev-to-prod.js
```
- Clears production data (after backup)
- Copies all users, builder profiles, etc.
- Maintains referential integrity

### 5. Verify Production
```bash
node scripts/verify-production-marketplace.js
```
- Lists all builders in production
- Verifies searchable/demo flags
- Confirms marketplace visibility

## Manual Sync Process

1. **Pre-flight Check**
   ```bash
   node scripts/verify-database-connection.js
   ```

2. **Backup Production**
   ```bash
   node scripts/backup-production-raw.js
   ```

3. **Sync Schema**
   ```bash
   node scripts/sync-schema-to-production.js
   ```

4. **Copy Data**
   ```bash
   node scripts/copy-dev-to-prod.js
   ```

5. **Verify Results**
   ```bash
   node scripts/verify-production-marketplace.js
   ```

## CI/CD Pipeline

The GitHub Actions workflow `.github/workflows/database-sync.yml` provides automated sync options:

- **verify**: Check database status
- **backup**: Backup production only
- **sync-schema**: Update production schema
- **sync-data**: Copy data to production
- **full-sync**: Complete sync process

### Required Secrets
- `DEV_DATABASE_URL`: Development database connection
- `PROD_DATABASE_URL`: Production database connection

## Environment Files
- **Development**: `.env`
- **Production**: `.env.production.local`

## Best Practices

1. **Always backup before sync**
2. **Test in development first**
3. **Verify results after sync**
4. **Keep backups for 30 days**
5. **Document any manual changes**

## Troubleshooting

### Schema Mismatch
If you encounter schema mismatch errors:
1. Run schema sync script
2. Regenerate Prisma client
3. Clear node_modules/.prisma if needed

### Connection Issues
- Ensure SSL is enabled for Neon
- Check environment variables
- Verify database URLs include proper SSL mode

## Success Criteria
- [ ] All 18 builders visible in production
- [ ] Liam's account with correct email
- [ ] Demo builders properly flagged
- [ ] No schema mismatch errors
- [ ] Marketplace fully functional

## Emergency Rollback
If sync fails:
1. Restore from latest backup
2. Check error logs
3. Fix issues in development
4. Retry sync process

## Maintenance Schedule
- Weekly verification checks
- Monthly full backup
- Sync as needed for updates

---
**Last Updated**: 2025-05-14  
**Next Review**: 2025-06-14