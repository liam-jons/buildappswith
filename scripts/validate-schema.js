#!/usr/bin/env node

/**
 * Database Schema Validation Utility
 * 
 * This script validates that the Prisma schema matches the database and identifies discrepancies.
 * It helps detect issues like missing fields or tables that could cause runtime errors.
 */

// Import required modules
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envFile = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Run database introspection and compare with current schema
 */
async function validateSchema() {
  try {
    console.log('Starting database schema validation...');
    
    // 1. Get table information from database
    const tablesResult = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_schema
      FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;
    
    console.log(`\nFound ${tablesResult.length} tables in database`);
    
    // 2. Get schema models from Prisma schema
    const modelNames = Object.keys(prisma)
      .filter(key => !key.startsWith('$') && !key.startsWith('_'));
    
    console.log(`Found ${modelNames.length} models in Prisma schema`);
    
    // 3. Check for tables without models
    const tableNames = tablesResult.map(t => t.table_name);
    const tablesWithoutModels = tableNames.filter(tableName => 
      !modelNames.some(model => model.toLowerCase() === tableName.toLowerCase()));
    
    if (tablesWithoutModels.length > 0) {
      console.log('\n⚠️ Tables in database without Prisma models:');
      tablesWithoutModels.forEach(table => console.log(`- ${table}`));
    }
    
    // 4. Check for models without tables
    const modelsWithoutTables = modelNames.filter(model => 
      !tableNames.some(table => table.toLowerCase() === model.toLowerCase()));
    
    if (modelsWithoutTables.length > 0) {
      console.log('\n⚠️ Prisma models without database tables:');
      modelsWithoutTables.forEach(model => console.log(`- ${model}`));
    }
    
    // 5. For each Prisma model, check column structure
    console.log('\nValidating field structure for each model...');
    const modelChecks = [];
    
    for (const model of modelNames) {
      // Skip models without tables
      if (modelsWithoutTables.includes(model)) continue;
      
      // Get table columns
      try {
        const tableName = tableNames.find(t => t.toLowerCase() === model.toLowerCase());
        
        const columnsResult = await prisma.$queryRaw`
          SELECT 
            column_name, 
            data_type, 
            is_nullable
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public'
            AND table_name = ${tableName}
        `;
        
        // Try to get a sample record to check which fields are available
        const sampleRecordPromise = prisma[model].findFirst().catch(() => null);
        
        // Try to use Prisma's query builder to detect field errors
        const queryErrorsPromise = Promise.allSettled([
          // Test count operation
          prisma[model].count(),
          // Test findFirst operation with fields
          prisma[model].findFirst()
        ]);
        
        const [sampleRecord, queryErrors] = await Promise.all([
          sampleRecordPromise,
          queryErrorsPromise
        ]);
        
        const fieldErrors = [];
        
        // Check for query errors
        const queryIssues = queryErrors
          .filter(result => result.status === 'rejected')
          .map(result => result.reason);
        
        if (queryIssues.length > 0) {
          console.log(`\n⚠️ Query errors for model ${model}:`);
          queryIssues.forEach(issue => console.log(`- ${issue.message}`));
        }
        
        // Compare sample record fields with database columns
        if (sampleRecord) {
          const recordFields = Object.keys(sampleRecord);
          const columnNames = columnsResult.map(c => c.column_name);
          
          const fieldsWithoutColumns = recordFields.filter(field => 
            !columnNames.includes(field) && !field.includes('_'));
          
          if (fieldsWithoutColumns.length > 0) {
            fieldErrors.push({
              type: 'field-without-column',
              fields: fieldsWithoutColumns
            });
          }
        }
        
        modelChecks.push({
          model,
          tableName,
          columnsCount: columnsResult.length,
          queryIssues: queryIssues.length > 0,
          fieldErrors
        });
        
      } catch (error) {
        console.error(`Error checking model ${model}:`, error.message);
        modelChecks.push({
          model,
          error: error.message,
          success: false
        });
      }
    }
    
    // Print summary report
    console.log('\n========== Schema Validation Report ==========');
    console.log(`Models checked: ${modelChecks.length}`);
    
    const modelsWithIssues = modelChecks.filter(m => 
      m.error || m.queryIssues || (m.fieldErrors && m.fieldErrors.length > 0));
    
    console.log(`Models with issues: ${modelsWithIssues.length}`);
    
    if (modelsWithIssues.length > 0) {
      console.log('\nDetailed Issues:');
      modelsWithIssues.forEach(model => {
        console.log(`\n🔍 ${model.model}:`);
        
        if (model.error) {
          console.log(`  - Error: ${model.error}`);
        }
        
        if (model.queryIssues) {
          console.log(`  - Has query issues`);
        }
        
        if (model.fieldErrors && model.fieldErrors.length > 0) {
          model.fieldErrors.forEach(error => {
            if (error.type === 'field-without-column') {
              console.log(`  - Fields without database columns: ${error.fields.join(', ')}`);
            }
          });
        }
      });
    }
    
    console.log('\n✅ Schema validation completed');
    
  } catch (error) {
    console.error('Error validating schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
validateSchema().catch(console.error);