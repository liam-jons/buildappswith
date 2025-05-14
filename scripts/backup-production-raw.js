#!/usr/bin/env node

/**
 * Script to backup production database with raw SQL
 * Works with production schema which has imageUrl field
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Client } = require('pg');

async function backupProductionRaw() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', 'production', timestamp);
  
  // Get production connection string from env
  const productionUrl = process.env.PRODUCTION_DATABASE_URL || 
    (fs.existsSync('.env.production.local') ? 
      fs.readFileSync('.env.production.local', 'utf8')
        .split('\n')
        .find(line => line.startsWith('PRODUCTION_DATABASE_URL='))
        ?.split('=')[1]
        ?.replace(/["']/g, '') : null);
  
  if (!productionUrl || !productionUrl.includes('prod')) {
    throw new Error('Production database URL not found or invalid');
  }
  
  const client = new Client({
    connectionString: productionUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log(chalk.blue('🔄 Starting production database backup...\n'));
    console.log(chalk.yellow('Connected to:'), productionUrl.split('@')[1]);
    
    await client.connect();
    
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Export data with raw SQL
    console.log(chalk.green('\n📥 Exporting production data...'));
    
    // Get users
    const userResult = await client.query(`
      SELECT * FROM "User" ORDER BY "createdAt"
    `);
    
    // Get builder profiles
    const builderResult = await client.query(`
      SELECT * FROM "BuilderProfile" ORDER BY "createdAt"
    `);
    
    // Get client profiles
    const clientResult = await client.query(`
      SELECT * FROM "ClientProfile" ORDER BY "createdAt"
    `);
    
    // Get session types
    const sessionResult = await client.query(`
      SELECT * FROM "SessionType" ORDER BY "createdAt"
    `);
    
    // Combine data
    const users = userResult.rows.map(user => {
      const builderProfile = builderResult.rows.find(b => b.userId === user.id);
      const clientProfile = clientResult.rows.find(c => c.userId === user.id);
      const sessionTypes = sessionResult.rows.filter(s => s.userId === user.id);
      
      return {
        ...user,
        builderProfile: builderProfile || null,
        clientProfile: clientProfile || null,
        sessionTypes: sessionTypes || []
      };
    });
    
    const backupData = {
      timestamp: new Date().toISOString(),
      databaseName: 'production',
      users,
      rawData: {
        users: userResult.rows,
        builderProfiles: builderResult.rows,
        clientProfiles: clientResult.rows,
        sessionTypes: sessionResult.rows
      }
    };
    
    const dataFile = path.join(backupDir, 'production-data.json');
    fs.writeFileSync(dataFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Data exported to: ${dataFile}`);
    
    // Export current production schema (using SQL)
    console.log(chalk.green('\n📋 Exporting schema...'));
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    
    const schemaFile = path.join(backupDir, 'production-schema.json');
    fs.writeFileSync(schemaFile, JSON.stringify(schemaResult.rows, null, 2));
    
    console.log(`✅ Schema exported to: ${schemaFile}`);
    
    // Verify backup
    console.log(chalk.blue('\n🔍 Verifying backup...'));
    const backupSize = fs.statSync(dataFile).size;
    console.log(`  Data file size: ${(backupSize / 1024).toFixed(2)} KB`);
    console.log(`  Users backed up: ${userResult.rows.length}`);
    console.log(`  Builders backed up: ${builderResult.rows.length}`);
    
    // Check for Liam
    const liam = userResult.rows.find(u => u.email === 'liam@buildappswith.com');
    if (liam) {
      console.log(chalk.green(`\n✅ Found Liam's account:`));
      console.log(`  ID: ${liam.id}`);
      console.log(`  Email: ${liam.email}`);
    }
    
    console.log(chalk.green('\n✅ Production backup completed successfully!'));
    console.log(chalk.yellow(`\nBackup location: ${backupDir}`));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Backup failed:'), error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run backup
backupProductionRaw();