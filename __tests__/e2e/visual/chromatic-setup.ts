import fs from 'fs';
import path from 'path';

/**
 * Prepares the directory structure required by Chromatic Playwright
 */
export function setupChromaticArchives() {
  // Create the directory structure Chromatic expects
  const baseDir = path.join(process.cwd(), 'test-results');
  const chromaticDir = path.join(baseDir, 'chromatic-archives');
  const archiveDir = path.join(chromaticDir, 'archive');
  
  // Ensure directories exist
  [baseDir, chromaticDir, archiveDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Create an index.json file required by Chromatic
  const indexData = {
    "v": 4,
    "stories": {
      "homepage--default-view": {
        "id": "homepage--default-view",
        "title": "Homepage",
        "name": "Default View",
        "importPath": "./archive/homepage",
        "tags": ["story"]
      },
      "marketplace--default-view": {
        "id": "marketplace--default-view",
        "title": "Marketplace",
        "name": "Default View",
        "importPath": "./archive/marketplace",
        "tags": ["story"]
      },
      "login-page--default-view": {
        "id": "login-page--default-view",
        "title": "Login Page",
        "name": "Default View",
        "importPath": "./archive/login",
        "tags": ["story"]
      },
      "signup-page--default-view": {
        "id": "signup-page--default-view",
        "title": "Signup Page",
        "name": "Default View",
        "importPath": "./archive/signup",
        "tags": ["story"]
      }
    }
  };
  
  // Write the index.json file
  fs.writeFileSync(
    path.join(chromaticDir, 'index.json'), 
    JSON.stringify(indexData, null, 2)
  );
  
  return archiveDir;
}