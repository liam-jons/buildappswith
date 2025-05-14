#!/usr/bin/env node

/**
 * Script to analyze the backup JSON and extract the schema
 */

const fs = require('fs');
const path = require('path');

const backupFile = process.argv[2] || './backups/2025-05-14/clean-slate-1747210667481.json';

try {
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  console.log('📊 Analyzing backup data structure...\n');
  
  // Analyze first user for complete schema
  const sampleUser = backup.users[0];
  
  console.log('User fields:');
  Object.keys(sampleUser).forEach(key => {
    if (typeof sampleUser[key] !== 'object' || sampleUser[key] === null) {
      console.log(`  - ${key}: ${typeof sampleUser[key]} (value: ${JSON.stringify(sampleUser[key])})`);
    } else if (Array.isArray(sampleUser[key])) {
      console.log(`  - ${key}: array[${sampleUser[key].length}]`);
    } else {
      console.log(`  - ${key}: object`);
    }
  });
  
  // Analyze BuilderProfile
  if (sampleUser.builderProfile) {
    console.log('\nBuilderProfile fields:');
    Object.keys(sampleUser.builderProfile).forEach(key => {
      const value = sampleUser.builderProfile[key];
      if (value === null) {
        console.log(`  - ${key}: null`);
      } else if (typeof value !== 'object') {
        console.log(`  - ${key}: ${typeof value}`);
      } else if (Array.isArray(value)) {
        console.log(`  - ${key}: array[${value.length}]`);
      } else {
        console.log(`  - ${key}: object - ${JSON.stringify(value)}`);
      }
    });
  }
  
  // Analyze ClientProfile
  const clientUser = backup.users.find(u => u.clientProfile);
  if (clientUser?.clientProfile) {
    console.log('\nClientProfile fields:');
    Object.keys(clientUser.clientProfile).forEach(key => {
      const value = clientUser.clientProfile[key];
      console.log(`  - ${key}: ${typeof value}`);
    });
  }
  
  // Analyze SessionTypes
  const userWithSessions = backup.users.find(u => u.sessionTypes?.length > 0);
  if (userWithSessions?.sessionTypes[0]) {
    console.log('\nSessionType fields:');
    Object.keys(userWithSessions.sessionTypes[0]).forEach(key => {
      const value = userWithSessions.sessionTypes[0][key];
      console.log(`  - ${key}: ${typeof value}`);
    });
  }
  
  // Find Liam's account
  const liam = backup.users.find(u => u.email === 'liam@buildappswith.com');
  if (liam) {
    console.log('\n✅ Found Liam\'s account:');
    console.log(`  Email: ${liam.email}`);
    console.log(`  Roles: ${liam.roles.join(', ')}`);
    console.log(`  Has BuilderProfile: ${!!liam.builderProfile}`);
    console.log(`  Session Types: ${liam.sessionTypes?.length || 0}`);
  }
  
  console.log('\nSummary:');
  console.log(`Total users: ${backup.users.length}`);
  console.log(`Users with builder profiles: ${backup.users.filter(u => u.builderProfile).length}`);
  console.log(`Demo users: ${backup.users.filter(u => u.isDemo).length}`);
  console.log(`Searchable builders: ${backup.users.filter(u => u.builderProfile?.searchable).length}`);
  
} catch (error) {
  console.error('Error analyzing backup:', error);
}