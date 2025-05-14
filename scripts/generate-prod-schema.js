const { execSync } = require('child_process');
const fs = require('fs');

// Backup current schema
fs.copyFileSync('./prisma/schema.prisma', './prisma/schema.prisma.backup');

// Generate schema from production database
console.log('Pulling schema from production database...');
execSync('npx prisma db pull', {
  env: { ...process.env, DATABASE_URL: process.env.PROD_DATABASE_URL },
  stdio: 'inherit'
});

// Generate Prisma client
console.log('Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('Done! Your Prisma client now matches production.');
console.log('Original schema backed up to prisma/schema.prisma.backup');