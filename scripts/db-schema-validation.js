/**
 * Database Schema Validation Script
 * 
 * This script validates that the database schema is correctly configured
 * and consistent between development and test environments.
 */

// Import required dependencies
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Script configuration
const CONFIG = {
  outputPath: path.join(__dirname, '../test-results/schema-validation'),
  environments: ['development', 'test'],
  schemaSrcPath: path.join(__dirname, '../prisma/schema.prisma'),
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputPath)) {
  fs.mkdirSync(CONFIG.outputPath, { recursive: true });
}

// Initialize Prisma clients for each environment
const clients = {};

// Create database clients for each environment
async function initializeClients() {
  console.log('Initializing database clients...');
  
  for (const env of CONFIG.environments) {
    // Use appropriate URL based on environment
    const url = process.env[`DATABASE_URL_${env.toUpperCase()}`] || process.env.DATABASE_URL;
    
    if (!url) {
      console.error(`Error: No database URL defined for ${env} environment`);
      process.exit(1);
    }
    
    try {
      clients[env] = new PrismaClient({
        datasources: { db: { url } }
      });
      console.log(`✅ Connected to ${env} database`);
    } catch (error) {
      console.error(`Error connecting to ${env} database:`, error);
      process.exit(1);
    }
  }
}

// Get schema metadata for a specific environment
async function getSchemaMetadata(env) {
  const client = clients[env];
  
  try {
    console.log(`Getting schema metadata for ${env}...`);
    
    // Get tables and columns
    const tables = await client.$queryRaw`
      SELECT 
        table_name 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY 
        table_name
    `;
    
    // Get detailed information about each table
    const tableDetails = {};
    
    for (const { table_name } of tables) {
      // Get columns
      const columns = await client.$queryRaw`
        SELECT 
          column_name, 
          data_type,
          is_nullable,
          column_default
        FROM 
          information_schema.columns 
        WHERE 
          table_schema = 'public' 
          AND table_name = ${table_name}
        ORDER BY 
          ordinal_position
      `;
      
      // Get indexes
      const indexes = await client.$queryRaw`
        SELECT 
          indexname, 
          indexdef
        FROM 
          pg_indexes 
        WHERE 
          schemaname = 'public' 
          AND tablename = ${table_name}
        ORDER BY 
          indexname
      `;
      
      // Get foreign keys
      const foreignKeys = await client.$queryRaw`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = ${table_name}
        ORDER BY
          tc.constraint_name
      `;
      
      tableDetails[table_name] = {
        columns,
        indexes,
        foreignKeys
      };
    }
    
    return {
      tables: tables.map(t => t.table_name),
      tableDetails
    };
  } catch (error) {
    console.error(`Error getting schema metadata for ${env}:`, error);
    throw error;
  }
}

// Compare schemas between environments
function compareSchemas(schemas) {
  console.log('Comparing schemas between environments...');
  
  const results = {
    missingTables: {},
    missingColumns: {},
    typeMismatches: {},
    missingIndexes: {},
    missingForeignKeys: {},
    summary: {
      isConsistent: true,
      issues: 0
    }
  };
  
  // Use the first environment as the reference
  const referenceEnv = CONFIG.environments[0];
  const referenceSchema = schemas[referenceEnv];
  
  // Compare each environment against the reference
  for (const env of CONFIG.environments.slice(1)) {
    const targetSchema = schemas[env];
    results.missingTables[env] = [];
    results.missingColumns[env] = {};
    results.typeMismatches[env] = {};
    results.missingIndexes[env] = {};
    results.missingForeignKeys[env] = {};
    
    // Check for missing tables
    for (const table of referenceSchema.tables) {
      if (!targetSchema.tables.includes(table)) {
        results.missingTables[env].push(table);
        results.summary.isConsistent = false;
        results.summary.issues++;
      }
    }
    
    // Check for missing columns and type mismatches
    for (const table of referenceSchema.tables) {
      if (!targetSchema.tables.includes(table)) continue;
      
      results.missingColumns[env][table] = [];
      results.typeMismatches[env][table] = [];
      
      const refColumns = referenceSchema.tableDetails[table].columns;
      const targetColumns = targetSchema.tableDetails[table].columns;
      
      // Create a map of target columns for easy lookup
      const targetColumnMap = {};
      for (const column of targetColumns) {
        targetColumnMap[column.column_name] = column;
      }
      
      // Compare each reference column
      for (const refColumn of refColumns) {
        const targetColumn = targetColumnMap[refColumn.column_name];
        
        if (!targetColumn) {
          results.missingColumns[env][table].push(refColumn.column_name);
          results.summary.isConsistent = false;
          results.summary.issues++;
        } else if (refColumn.data_type !== targetColumn.data_type) {
          results.typeMismatches[env][table].push({
            column: refColumn.column_name,
            referenceType: refColumn.data_type,
            targetType: targetColumn.data_type
          });
          results.summary.isConsistent = false;
          results.summary.issues++;
        }
      }
      
      // Clean up empty arrays
      if (results.missingColumns[env][table].length === 0) {
        delete results.missingColumns[env][table];
      }
      if (results.typeMismatches[env][table].length === 0) {
        delete results.typeMismatches[env][table];
      }
    }
    
    // Check for missing indexes
    for (const table of referenceSchema.tables) {
      if (!targetSchema.tables.includes(table)) continue;
      
      results.missingIndexes[env][table] = [];
      
      const refIndexes = referenceSchema.tableDetails[table].indexes;
      const targetIndexes = targetSchema.tableDetails[table].indexes;
      
      // Create a map of target indexes for easy lookup
      const targetIndexMap = {};
      for (const index of targetIndexes) {
        targetIndexMap[index.indexname] = index;
      }
      
      // Compare each reference index
      for (const refIndex of refIndexes) {
        if (refIndex.indexname.startsWith('pk_') || refIndex.indexname.startsWith('PK_')) {
          // Skip primary key indexes as they should be automatically created
          continue;
        }
        
        const targetIndex = targetIndexMap[refIndex.indexname];
        
        if (!targetIndex) {
          results.missingIndexes[env][table].push(refIndex.indexname);
          results.summary.isConsistent = false;
          results.summary.issues++;
        }
      }
      
      // Clean up empty arrays
      if (results.missingIndexes[env][table].length === 0) {
        delete results.missingIndexes[env][table];
      }
    }
    
    // Check for missing foreign keys
    for (const table of referenceSchema.tables) {
      if (!targetSchema.tables.includes(table)) continue;
      
      results.missingForeignKeys[env][table] = [];
      
      const refForeignKeys = referenceSchema.tableDetails[table].foreignKeys;
      const targetForeignKeys = targetSchema.tableDetails[table].foreignKeys;
      
      // Create a map of target foreign keys for easy lookup
      const targetFKMap = {};
      for (const fk of targetForeignKeys) {
        targetFKMap[`${fk.column_name}_to_${fk.foreign_table_name}.${fk.foreign_column_name}`] = fk;
      }
      
      // Compare each reference foreign key
      for (const refFK of refForeignKeys) {
        const key = `${refFK.column_name}_to_${refFK.foreign_table_name}.${refFK.foreign_column_name}`;
        const targetFK = targetFKMap[key];
        
        if (!targetFK) {
          results.missingForeignKeys[env][table].push({
            column: refFK.column_name,
            references: `${refFK.foreign_table_name}.${refFK.foreign_column_name}`
          });
          results.summary.isConsistent = false;
          results.summary.issues++;
        }
      }
      
      // Clean up empty arrays
      if (results.missingForeignKeys[env][table].length === 0) {
        delete results.missingForeignKeys[env][table];
      }
    }
  }
  
  return results;
}

// Write comparison results to file
function writeResults(results) {
  console.log('Writing schema comparison results...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(CONFIG.outputPath, `schema-validation-${timestamp}.json`);
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`Results written to ${outputFile}`);
  
  // Also write a summary markdown file
  const summaryFile = path.join(CONFIG.outputPath, `schema-validation-${timestamp}.md`);
  
  let summaryContent = `# Database Schema Validation Summary\n\n`;
  summaryContent += `**Date:** ${new Date().toLocaleString()}\n\n`;
  summaryContent += `**Environments Compared:** ${CONFIG.environments.join(', ')}\n\n`;
  summaryContent += `**Schema Consistency:** ${results.summary.isConsistent ? '✅ Consistent' : '❌ Inconsistent'}\n\n`;
  
  if (results.summary.issues > 0) {
    summaryContent += `**Issues Found:** ${results.summary.issues}\n\n`;
    summaryContent += `## Schema Differences\n\n`;
    
    // Use the first environment as the reference
    const referenceEnv = CONFIG.environments[0];
    
    // Add missing tables
    for (const env of CONFIG.environments.slice(1)) {
      if (results.missingTables[env].length > 0) {
        summaryContent += `### Missing Tables in ${env} (compared to ${referenceEnv})\n\n`;
        for (const table of results.missingTables[env]) {
          summaryContent += `- \`${table}\`\n`;
        }
        summaryContent += '\n';
      }
    }
    
    // Add missing columns
    for (const env of CONFIG.environments.slice(1)) {
      const missingColumnTables = Object.keys(results.missingColumns[env]);
      if (missingColumnTables.length > 0) {
        summaryContent += `### Missing Columns in ${env} (compared to ${referenceEnv})\n\n`;
        for (const table of missingColumnTables) {
          summaryContent += `#### Table: \`${table}\`\n\n`;
          for (const column of results.missingColumns[env][table]) {
            summaryContent += `- \`${column}\`\n`;
          }
          summaryContent += '\n';
        }
      }
    }
    
    // Add type mismatches
    for (const env of CONFIG.environments.slice(1)) {
      const mismatchTables = Object.keys(results.typeMismatches[env]);
      if (mismatchTables.length > 0) {
        summaryContent += `### Type Mismatches in ${env} (compared to ${referenceEnv})\n\n`;
        for (const table of mismatchTables) {
          summaryContent += `#### Table: \`${table}\`\n\n`;
          summaryContent += `| Column | ${referenceEnv} Type | ${env} Type |\n`;
          summaryContent += `| ------ | ------------- | ---------- |\n`;
          for (const mismatch of results.typeMismatches[env][table]) {
            summaryContent += `| \`${mismatch.column}\` | ${mismatch.referenceType} | ${mismatch.targetType} |\n`;
          }
          summaryContent += '\n';
        }
      }
    }
    
    // Add missing indexes
    for (const env of CONFIG.environments.slice(1)) {
      const missingIndexTables = Object.keys(results.missingIndexes[env]);
      if (missingIndexTables.length > 0) {
        summaryContent += `### Missing Indexes in ${env} (compared to ${referenceEnv})\n\n`;
        for (const table of missingIndexTables) {
          summaryContent += `#### Table: \`${table}\`\n\n`;
          for (const index of results.missingIndexes[env][table]) {
            summaryContent += `- \`${index}\`\n`;
          }
          summaryContent += '\n';
        }
      }
    }
    
    // Add missing foreign keys
    for (const env of CONFIG.environments.slice(1)) {
      const missingFKTables = Object.keys(results.missingForeignKeys[env]);
      if (missingFKTables.length > 0) {
        summaryContent += `### Missing Foreign Keys in ${env} (compared to ${referenceEnv})\n\n`;
        for (const table of missingFKTables) {
          summaryContent += `#### Table: \`${table}\`\n\n`;
          summaryContent += `| Column | References |\n`;
          summaryContent += `| ------ | ---------- |\n`;
          for (const fk of results.missingForeignKeys[env][table]) {
            summaryContent += `| \`${fk.column}\` | \`${fk.references}\` |\n`;
          }
          summaryContent += '\n';
        }
      }
    }
  } else {
    summaryContent += `✅ No schema differences detected between environments.\n\n`;
  }
  
  // Add migration recommendation if needed
  if (!results.summary.isConsistent) {
    summaryContent += `## Recommendations\n\n`;
    summaryContent += `The following actions are recommended to ensure schema consistency:\n\n`;
    summaryContent += `1. Apply any missing migrations to the test environment\n`;
    summaryContent += `2. Run Prisma generate to update the Prisma client\n`;
    summaryContent += `3. Re-run this validation script to confirm fixes\n\n`;
    summaryContent += `\`\`\`bash\n`;
    summaryContent += `# Apply migrations\n`;
    summaryContent += `DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy\n\n`;
    summaryContent += `# Generate Prisma client\n`;
    summaryContent += `npx prisma generate\n\n`;
    summaryContent += `# Re-run validation\n`;
    summaryContent += `node scripts/db-schema-validation.js\n`;
    summaryContent += `\`\`\`\n`;
  }
  
  fs.writeFileSync(summaryFile, summaryContent);
  console.log(`Summary written to ${summaryFile}`);
  
  return outputFile;
}

// Main function
async function validateDatabaseSchema() {
  try {
    await initializeClients();
    
    // Get schema metadata for each environment
    const schemas = {};
    for (const env of CONFIG.environments) {
      schemas[env] = await getSchemaMetadata(env);
    }
    
    // Compare schemas
    const results = compareSchemas(schemas);
    
    // Write results to file
    const outputFile = writeResults(results);
    
    // Close database connections
    for (const env of CONFIG.environments) {
      await clients[env].$disconnect();
    }
    
    // Output final status
    console.log('\n=== Schema Validation Complete ===');
    console.log(`Schema consistency: ${results.summary.isConsistent ? '✅ CONSISTENT' : '❌ INCONSISTENT'}`);
    console.log(`Issues found: ${results.summary.issues}`);
    console.log(`Results saved to ${outputFile}`);
    
    return results.summary.isConsistent;
  } catch (error) {
    console.error('Error validating database schema:', error);
    
    // Close database connections
    for (const env of CONFIG.environments) {
      if (clients[env]) {
        await clients[env].$disconnect();
      }
    }
    
    return false;
  }
}

// Run the script
validateDatabaseSchema()
  .then(isConsistent => {
    process.exit(isConsistent ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });