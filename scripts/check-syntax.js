#!/usr/bin/env node

const fs = require('fs');
const { parseModule } = require('acorn');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Try to parse the file as JavaScript/TypeScript
  parseModule(content, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: false,
    allowSuperOutsideMethod: false,
  });
  
  console.log(`✅ ${filePath} has valid syntax`);
} catch (error) {
  console.error(`❌ Syntax error in ${filePath}:`);
  console.error(error.message);
  if (error.loc) {
    console.error(`Line ${error.loc.line}, Column ${error.loc.column}`);
  }
  process.exit(1);
}