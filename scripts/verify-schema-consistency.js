#!/usr/bin/env node

/**
 * Automated schema consistency verification
 * Compares development and production schemas
 */

const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');

async function verifySchemaConsistency() {
  console.log('🔍 Verifying schema consistency...\n');
  
  const issues = [];
  
  try {
    // Test development database
    process.env.DATABASE_URL = process.env.DEV_DATABASE_URL;
    const devPrisma = new PrismaClient();
    const devSchema = await introspectSchema(devPrisma);
    await devPrisma.$disconnect();
    
    // Test production database
    process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
    const prodPrisma = new PrismaClient();
    const prodSchema = await introspectSchema(prodPrisma);
    await prodPrisma.$disconnect();
    
    // Compare schemas
    const differences = compareSchemas(devSchema, prodSchema);
    
    if (differences.length > 0) {
      console.log(chalk.red('❌ Schema inconsistencies found:\n'));
      differences.forEach(diff => {
        console.log(chalk.yellow(`  - ${diff}`));
        issues.push(diff);
      });
    } else {
      console.log(chalk.green('✅ Schemas are consistent!'));
    }
    
    // Test critical queries
    console.log('\n🧪 Testing critical queries...');
    await testCriticalQueries();
    
    return issues;
    
  } catch (error) {
    console.error(chalk.red('Error during verification:'), error);
    throw error;
  }
}

async function introspectSchema(prisma) {
  const tables = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;
  
  const schema = {};
  tables.forEach(col => {
    if (!schema[col.table_name]) {
      schema[col.table_name] = {};
    }
    schema[col.table_name][col.column_name] = {
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      default: col.column_default
    };
  });
  
  return schema;
}

function compareSchemas(devSchema, prodSchema) {
  const differences = [];
  
  // Check for missing tables
  Object.keys(devSchema).forEach(table => {
    if (!prodSchema[table]) {
      differences.push(`Table '${table}' missing in production`);
    }
  });
  
  // Check for missing columns
  Object.keys(devSchema).forEach(table => {
    if (prodSchema[table]) {
      Object.keys(devSchema[table]).forEach(column => {
        if (!prodSchema[table][column]) {
          differences.push(`Column '${table}.${column}' missing in production`);
        } else {
          // Check column properties
          const devCol = devSchema[table][column];
          const prodCol = prodSchema[table][column];
          
          if (devCol.type !== prodCol.type) {
            differences.push(`Type mismatch for '${table}.${column}': dev=${devCol.type}, prod=${prodCol.type}`);
          }
        }
      });
    }
  });
  
  return differences;
}

async function testCriticalQueries() {
  process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
  const prisma = new PrismaClient();
  
  try {
    // Test marketplace query
    const builders = await prisma.builderProfile.findMany({
      where: { searchable: true },
      select: {
        completedProjects: true,
        responseRate: true,
        user: true
      }
    });
    console.log(chalk.green(`  ✓ Marketplace query successful (${builders.length} builders)`));
    
  } catch (error) {
    console.log(chalk.red(`  ✗ Marketplace query failed: ${error.message}`));
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Add to package.json scripts
if (require.main === module) {
  verifySchemaConsistency()
    .then(issues => {
      if (issues.length > 0) {
        process.exit(1);
      }
    })
    .catch(() => process.exit(1));
}

module.exports = { verifySchemaConsistency };