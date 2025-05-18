# CRITICAL DATABASE GUIDE - buildappswith.com
**For Claude & Liam - NO ASSUMPTIONS**

## ⚠️ FUNDAMENTAL SETUP FACTS

1. **Two Separate Neon Databases** (NOT branches):
   - Development: `Buildappswith-dev` 
   - Production: `Buildappswith-prod`
   - These are COMPLETELY SEPARATE databases with different schemas

2. **Database URLs**:
   ```bash
   # Development (default in .env)
   postgresql://...@ep-shiny-star-abb3se6s-pooler.eu-west-2.aws.neon.tech/Buildappswith-dev
   
   # Production (in .env.production.local)
   postgresql://...@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod
   ```

## 🚨 BEFORE DOING ANYTHING

1. **ALWAYS verify which database you're connected to**:
   ```javascript
   const dbInfo = await prisma.$queryRaw`SELECT current_database()`;
   console.log('Connected to:', dbInfo[0].current_database);
   ```

2. **Check the DATABASE_URL**:
   ```bash
   echo $DATABASE_URL | grep -o 'dev\|prod'
   ```

3. **For production work, ALWAYS**:
   ```javascript
   require('dotenv').config({ path: '.env.production.local' });
   ```

## 📋 PRE-LAUNCH CHECKLIST

### Schema Synchronization
- [ ] Development schema is the source of truth
- [ ] Production must match development EXACTLY
- [ ] Use Prisma migrations, not manual SQL
- [ ] NO schema differences allowed

### Data Requirements
- [ ] Copy ALL data from dev to prod
- [ ] Only searchable users appear in marketplace:
  - [ ] Liam (with correct email)
  - [ ] Demo users (isDemo: true)

### Scripts to Keep
1. `scripts/verify-database-connection.js` - ALWAYS run first
2. `scripts/sync-dev-to-prod.js` - Complete database sync
3. `scripts/verify-marketplace.js` - Final verification

### Scripts to Archive
- All one-off fixes
- All manual SQL scripts
- All workaround solutions

## 🔄 STANDARD WORKFLOW

1. **Start Every Session**:
   ```bash
   node scripts/verify-database-connection.js
   ```

2. **For Production Work**:
   ```bash
   export DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d'"' -f2)
   ```

3. **For Development Work**:
   ```bash
   export DATABASE_URL=$(grep DATABASE_URL .env | cut -d'=' -f2)
   ```

## ⚠️ COMMON PITFALLS

1. **Wrong Database**: Always working in dev when you mean prod
2. **Schema Mismatch**: Dev and prod have different columns/constraints
3. **Environment Loading**: Not loading the right .env file

## 🚀 LAUNCH PREPARATION

### Neon Setup
- Development database: Independent database
- Production database: Independent database
- NO branching strategy
- Manual promotion from dev to prod

### Required Scripts
```javascript
// 1. verify-database-connection.js
async function verifyConnection() {
  const db = await prisma.$queryRaw`SELECT current_database()`;
  const userCount = await prisma.user.count();
  const builderCount = await prisma.builderProfile.count();
  
  console.log(`Database: ${db[0].current_database}`);
  console.log(`Users: ${userCount}, Builders: ${builderCount}`);
}

// 2. sync-dev-to-prod.js
async function syncDevToProd() {
  // 1. Backup production
  // 2. Copy schema from dev
  // 3. Copy all data from dev
  // 4. Set searchable flags appropriately
  // 5. Verify marketplace
}
```

### GitHub Actions
- [ ] Pre-deployment database verification
- [ ] Schema consistency checks
- [ ] Marketplace functionality tests

### Vercel Settings
- [ ] Production environment variables
- [ ] Build commands include Prisma generate
- [ ] Preview deployments use dev database

## 🤔 QUESTIONS FOR NEXT SESSION

1. **Demo Users**: Should they have Clerk authentication?
2. **Searchable Logic**: Only Liam + demos, or other criteria?
3. **Data Migration**: Any production data to preserve? (Comment from Liam - no data to preserve)
4. **Backup Strategy**: Automated backups needed?
5. **Monitoring**: What alerts do you want?

## 📝 SESSION TEMPLATE

For future sessions, start with:
```
Session Type: Database Operations
Environment: [Development/Production]
Primary Goal: [Specific objective]
Current State: [What's working/not working]
Critical Context: [Any special considerations]

Pre-flight Checks:
- [ ] Verified database connection
- [ ] Correct environment variables loaded
- [ ] Backup created (if production)
```

---
**REMEMBER**: When in doubt, VERIFY DATABASE CONNECTION FIRST!