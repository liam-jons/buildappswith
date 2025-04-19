# Database Seeding Scripts

This directory contains scripts to seed the database with sample data for development and testing purposes.

## Available Scripts

- `seed-builder-profiles.js`: Reliable JS script that correctly loads environment variables
- `run-builder-seed.sh`: Wrapper script for the environment-aware JS seeding
- `create-profiles.ts`: TypeScript version (may have path resolution issues)
- `run-seeding.sh`: Wrapper script for TypeScript seeding
- `quick-seed.js`: Simple JavaScript version (had environment variable issues)
- `quick-seed.sh`: Wrapper script for simple JS seeding

## Usage

To run the seeding process:

```bash
# RECOMMENDED: Use the environment-aware script
chmod +x scripts/seed-data/run-builder-seed.sh
./scripts/seed-data/run-builder-seed.sh
```

OR run the JavaScript file directly:

```bash
node scripts/seed-data/seed-builder-profiles.js
```

Alternative methods (if the above doesn't work):

```bash
# Method 2: TypeScript version with path resolution
chmod +x scripts/seed-data/run-seeding.sh
./scripts/seed-data/run-seeding.sh

# Method 3: Simple JavaScript version
chmod +x scripts/seed-data/quick-seed.sh
./scripts/seed-data/quick-seed.sh
```

## What Gets Created

1. **Liam Jones's Profile**: Created with expert validation tier (3) and detailed portfolio
2. **5 Additional Builder Profiles**:
   - Sophie Chen (Frontend AI Developer)
   - Michael Rodriguez (Full-Stack AI Developer) 
   - Aisha Patel (Data Scientist & AI App Builder)
   - David Kim (Business AI Solutions Developer)
   - Emma Taylor (Creative AI Developer)

Each profile includes:
- User account with verified email
- Builder profile with bio, headline, and rating
- Skills relevant to their specialization
- Sample portfolio project

## Important Notes

- Running this script multiple times won't create duplicate profiles if they already exist
- The script is meant for development environments only
- You need database access to run this script
