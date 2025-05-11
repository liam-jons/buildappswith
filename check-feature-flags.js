// Script to list available feature flags
try {
  const fs = require('fs');
  const path = require('path');
  
  const featureFlagsFile = path.join(__dirname, 'lib', 'feature-flags.ts');
  const content = fs.readFileSync(featureFlagsFile, 'utf8');
  
  // Extract enum values using regex
  const enumMatch = content.match(/enum FeatureFlag \{([^}]+)\}/);
  if (enumMatch && enumMatch[1]) {
    const enumValues = enumMatch[1]
      .split(',')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('=');
        return {
          name: parts[0].trim(),
          value: parts[1] ? parts[1].trim().replace(/['"\s]/g, '') : undefined
        };
      });
      
    console.log('Feature Flags from file:', enumValues);
  } else {
    console.log('Could not parse feature flags enum');
  }
  
  // Extract default values
  const defaultFlagsMatch = content.match(/DEFAULT_FLAGS: Record<FeatureFlag, boolean> = \{([^}]+)\}/);
  if (defaultFlagsMatch && defaultFlagsMatch[1]) {
    const flagsLines = defaultFlagsMatch[1]
      .split(',')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(':');
        return {
          flag: parts[0].replace(/[\[\]]/g, '').trim(),
          enabled: parts[1] ? parts[1].trim() === 'true' : undefined
        };
      });
      
    console.log('\nDefault Flag Values:', flagsLines);
  } else {
    console.log('Could not parse default flag values');
  }
} catch (error) {
  console.error('Error reading feature flags:', error);
}