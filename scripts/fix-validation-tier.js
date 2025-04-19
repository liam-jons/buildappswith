/**
 * Script to fix ValidationTier capitalization issues
 * Version: 0.1.0
 * 
 * This script updates mock data to use lowercase validation tier values
 * that match the ComponentValidationTier type.
 */

const fs = require('fs');
const path = require('path');

const MOCK_BUILDERS_PATH = path.join(__dirname, '../lib/data/mockBuilders.ts');

// Read the mock builders file
try {
  let content = fs.readFileSync(MOCK_BUILDERS_PATH, 'utf8');
  
  // Replace all occurrences of validation tier values with lowercase versions
  content = content.replace(/validationTier: ['"]Expert['"]/g, 'validationTier: \'expert\'');
  content = content.replace(/validationTier: ['"]Established['"]/g, 'validationTier: \'established\'');
  content = content.replace(/validationTier: ['"]Entry['"]/g, 'validationTier: \'entry\'');
  
  // Write the updated content back to the file
  fs.writeFileSync(MOCK_BUILDERS_PATH, content);
  
  console.log('Successfully updated ValidationTier values in mockBuilders.ts');
} catch (error) {
  console.error('Error updating mockBuilders.ts:', error);
}

// Fix validation-tier-badge.tsx component if it exists
const VALIDATION_TIER_BADGE_PATH = path.join(__dirname, '../components/profile/validation-tier-badge.tsx');

try {
  if (fs.existsSync(VALIDATION_TIER_BADGE_PATH)) {
    let content = fs.readFileSync(VALIDATION_TIER_BADGE_PATH, 'utf8');
    
    // Check if we need to update the component's enum
    if (!content.includes('export type ValidationTier = \'entry\' | \'established\' | \'expert\';')) {
      // Replace inconsistent capitalization if found
      content = content.replace(/export type ValidationTier = ['"]Entry['"] \| ['"]Established['"] \| ['"]Expert['"];/g, 
                               'export type ValidationTier = \'entry\' | \'established\' | \'expert\';');
      
      // If the enum was defined differently, try to look for a pattern and fix it
      if (!content.includes('export type ValidationTier')) {
        // Add the type definition if it doesn't exist
        const insertPos = content.indexOf('export function ValidationTierBadge');
        if (insertPos !== -1) {
          const newContent = content.slice(0, insertPos) + 
                            'export type ValidationTier = \'entry\' | \'established\' | \'expert\';\n\n' + 
                            content.slice(insertPos);
          content = newContent;
        }
      }
      
      fs.writeFileSync(VALIDATION_TIER_BADGE_PATH, content);
      console.log('Successfully updated ValidationTier in validation-tier-badge.tsx');
    } else {
      console.log('ValidationTier already correctly defined in validation-tier-badge.tsx');
    }
  } else {
    console.log('validation-tier-badge.tsx not found, skipping...');
  }
} catch (error) {
  console.error('Error updating validation-tier-badge.tsx:', error);
}

console.log('\nDone. Please run TypeScript type checking to verify the fixes.');
