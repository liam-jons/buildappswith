# Database Launch Preparation Session Prompt

## Session Type: Pre-Launch Database Synchronization
**Environment**: Production  
**Branch**: main  
**Critical Email**: Production uses `liam@buildappswith.com` (NOT .ai)

## Current State
- Production marketplace shows only 1 builder (Liam)
- Development has 18 builders (demos included)
- Databases are SEPARATE (not branches)
- Schema mismatch between dev and prod

## Goal
Complete clean-slate synchronization: Development → Production

## Critical Context
1. **Two Separate Databases**:
   - Dev: `Buildappswith-dev`
   - Prod: `Buildappswith-prod`

2. **Environment Files**:
   - Dev: `.env`
   - Prod: `.env.production.local`

3. **Key Differences**:
   - Schema: prod has different constraints
   - Data: prod has 1 user, dev has 27

## Pre-Flight Verification (MANDATORY)
```bash
# 1. Check current database
node scripts/verify-database-connection.js

# 2. Verify environment
echo $DATABASE_URL | grep -o 'dev\|prod'

# 3. Confirm production URL is loaded
grep DATABASE_URL .env.production.local
```

## Required Outcomes
1. Production schema matches development exactly
2. All development data copied to production
3. Marketplace shows Liam + demo builders
4. Automated verification scripts in place
5. CI/CD pipeline for future changes

## Clarifications Before Starting
1. Should demo users have Clerk authentication in production? No, the builder profiles are purely for demo purposes on the marketplace. Not for this session, but in future we'll have it that when a user clicks "View Profile", the button notifies them that it's a demo account. The only account that should work in prod is Liam's.
2. Any production data that must be preserved? No, this is a fresh cut of the schema and data.
3. Preferred backup location/format? Whatever is considered best practice. Does Neon do this anyway?
4. What monitoring/alerts do you want? We'll cover this in a future session.
5. Any other builders besides Liam should be searchable? Only those with the isDemo flag set to TRUE. This builders will need a record in BuilderProfile, if one doesn't already exist, as this is where the "searchable" flag is set too.

## Scripts to Create
1. `verify-database-connection.js` - Environment checker
2. `backup-production.js` - Full backup before changes
3. `sync-schema-dev-to-prod.js` - Schema synchronization
4. `copy-data-dev-to-prod.js` - Data migration
5. `verify-marketplace-prod.js` - Final verification

## Success Criteria
- [ ] Production marketplace shows multiple builders
- [ ] No schema mismatch errors
- [ ] All migrations tracked in version control
- [ ] Automated deployment pipeline working
- [ ] Clear documentation for future changes

## ⚠️ Critical Reminders
- VERIFY DATABASE FIRST - don't assume
- Production email is .com not .ai
- These are separate databases, not branches
- Use proper migrations, not manual SQL
- Check root cause, not just symptoms

---
**START HERE**: Run pre-flight verification before ANY other action