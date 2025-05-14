#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/marketplace/data/marketplace-service.ts');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the problematic lines have been fixed
  const lines = content.split('\n');
  
  // Find the line with "Calculate pagination info"
  const paginationCommentIndex = lines.findIndex(line => line.includes('// Calculate pagination info'));
  
  if (paginationCommentIndex >= 0) {
    console.log('Found pagination comment at line', paginationCommentIndex + 1);
    
    // Check the next few lines
    const nextLines = lines.slice(paginationCommentIndex, paginationCommentIndex + 5);
    console.log('\nNext 5 lines:');
    nextLines.forEach((line, index) => {
      console.log(`${paginationCommentIndex + index + 1}: ${line}`);
    });
    
    // Check for the problematic pattern
    const hasStrayObject = nextLines.some(line => 
      line.trim().match(/^\s*(page|limit|total|totalPages|hasMore)\s*,?\s*$/)
    );
    
    if (hasStrayObject) {
      console.log('\n❌ Found stray object properties - syntax error likely');
    } else {
      console.log('\n✅ Code structure looks correct');
    }
  } else {
    console.log('Could not find pagination comment');
  }
  
  // Check for the return statement structure
  const returnIndex = lines.findIndex((line, index) => 
    index > paginationCommentIndex && line.includes('return {')
  );
  
  if (returnIndex >= 0) {
    console.log(`\nFound return statement at line ${returnIndex + 1}`);
    console.log('Return structure looks valid');
  }
  
} catch (error) {
  console.error('Error reading file:', error.message);
}