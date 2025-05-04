/**
 * NextAuth Migration Verification Script
 * 
 * This script scans the codebase for any remaining NextAuth references
 * and generates a report of files that need cleanup.
 * 
 * Usage:
 * 1. Run with `pnpm tsx lib/auth/clerk/verify-auth-migration.ts`
 * 2. Review the generated report for action items
 * 
 * Version: 1.0.1
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Configuration
const ROOT_DIR = process.cwd();
const REPORT_PATH = path.join(ROOT_DIR, 'auth-migration-report.md');
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'archive',
  'docs/archive',
  'scripts', // Exclude scripts directory to avoid false positives
];
const EXCLUDED_FILES = [
  'verify-auth-migration.ts', // This file
  'CLERK_AUTHENTICATION_CLEANUP_LIST.md', // Reference document
  'auth-migration-report.md', // Generated report
  'remove-nextauth-deps.js', // Dependency removal script
  'CLERK_FUTURE_RECOMMENDATIONS.md', // Migration documentation
  'CLERK_DOCUMENTATION_UPDATES_SUMMARY.md', // Migration documentation
  'CLERK_HOOKS_IMPLEMENTATION.md', // Clerk hooks documentation
  'CLERK_TEST_UTILITIES.md', // Test utilities documentation
];

// Search patterns
const NEXTAUTH_PATTERNS = [
  { pattern: 'next-auth', type: 'Import or Reference' },
  { pattern: 'NextAuth', type: 'Class or Type' },
  { pattern: 'getSession', type: 'Function Call', exclusions: ['getSessionTypes', 'getSessionTypeById', 'getSessionData', 'getSessionKey'] },
  { pattern: 'useSession', type: 'Hook' },
  { pattern: 'getServerSession', type: 'Function Call' },
  { pattern: 'SessionProvider', type: 'Component' },
  { pattern: 'NEXTAUTH', type: 'Environment Variable' },
];

// These patterns need context checking to avoid false positives
const CONTEXT_PATTERNS = [
  { 
    pattern: 'signIn', 
    type: 'Function Call',
    validContexts: ['useClerkAuth', 'useSignIn', 'Clerk', 'useAuth', 'auth']
  },
  // We're no longer checking for signOut since it's used legitimately in our Clerk implementation
  // and isn't a clear indicator of NextAuth usage
  // We're no longer checking for getCsrfToken in the CSRF utility
  // since it's not related to NextAuth but is a general CSRF protection utility
  // Removing the session pattern as it's too common and causing too many false positives
];

// File extensions to check
const FILE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.env',
];

// Types
interface FindingType {
  file: string;
  line: number;
  pattern: string;
  type: string;
  content: string;
  critical: boolean;
}

interface FileListType {
  toDelete: string[];
  toArchive: string[];
  toUpdate: string[];
}

// Helper to generate a hash for tracking processed files
function generateHash(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

// Check if a directory should be excluded
function shouldExcludeDir(dirPath: string): boolean {
  const dirName = path.basename(dirPath);
  return EXCLUDED_DIRS.includes(dirName);
}

// Check if a file should be excluded
function shouldExcludeFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return EXCLUDED_FILES.includes(fileName);
}

// Check if we should process this file based on extension
function shouldProcessFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return FILE_EXTENSIONS.includes(ext);
}

// Scan a file for NextAuth references
async function scanFile(filePath: string): Promise<FindingType[]> {
  const findings: FindingType[] = [];
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    // First, check for standard patterns
    lines.forEach((line, index) => {
      NEXTAUTH_PATTERNS.forEach(({ pattern, type, exclusions = [] }) => {
        if (line.includes(pattern)) {
          // Skip if the pattern matches one of the exclusions
          const hasExclusion = exclusions.some(exclusion => line.includes(exclusion));
          if (hasExclusion) return;
          
          // Skip if it's a reference to migration or cleanup
          const isMigrationReference = 
            line.includes('migrate') || 
            line.includes('cleanup') || 
            line.includes('remove') || 
            line.includes('replace') ||
            line.includes('documentation') ||
            line.includes('archive') ||
            line.includes('verification') ||
            line.includes('CLERK_AUTHENTICATION_CLEANUP_LIST.md');
          
          // Determine if finding is critical
          const isCritical = 
            line.includes('import') || 
            line.includes('from') || 
            type === 'Hook' || 
            type === 'Function Call' || 
            type === 'Component';
          
          if (!isMigrationReference || isCritical) {
            findings.push({
              file: filePath,
              line: index + 1,
              pattern,
              type,
              content: line.trim(),
              critical: isCritical,
            });
          }
        }
      });
    });
    
    // Now check for context-sensitive patterns
    // These need special handling to avoid false positives
    const contextFindings: FindingType[] = [];
    lines.forEach((line, index) => {
      CONTEXT_PATTERNS.forEach(({ pattern, type, validContexts }) => {
        if (line.includes(pattern)) {
          // Check if this is a NextAuth reference or a valid Clerk reference
          const isClerkContext = validContexts.some(context => 
            // Look for valid Clerk contexts in the nearby code
            line.includes(context) || 
            (index > 0 && lines[index - 1].includes(context)) ||
            (index > 1 && lines[index - 2].includes(context))
          );
          
          // Skip if it's a reference to migration or cleanup
          const isMigrationReference = 
            line.includes('migrate') || 
            line.includes('cleanup') || 
            line.includes('remove') || 
            line.includes('replace') ||
            line.includes('documentation') ||
            line.includes('archive') ||
            line.includes('verification') ||
            line.includes('CLERK_AUTHENTICATION_CLEANUP_LIST.md');
          
          // If we found a Clerk context, it's a valid use. If not, it's potentially a NextAuth reference
          if (!isClerkContext && (!isMigrationReference || type === 'Function Call')) {
            contextFindings.push({
              file: filePath,
              line: index + 1,
              pattern,
              type,
              content: line.trim(),
              critical: true, // Context-sensitive patterns are always critical if they're not in a Clerk context
            });
          }
        }
      });
    });
    
    // Add context findings to main findings
    findings.push(...contextFindings);
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
  }
  
  return findings;
}

// Recursively scan directories
async function scanDir(dirPath: string, findings: FindingType[] = []): Promise<FindingType[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldExcludeDir(fullPath)) {
          findings = await scanDir(fullPath, findings);
        }
      } else if (entry.isFile()) {
        if (!shouldExcludeFile(fullPath) && shouldProcessFile(fullPath)) {
          const fileFindings = await scanFile(fullPath);
          findings.push(...fileFindings);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return findings;
}

// Parse the cleanup list to get files that need to be processed
async function parseCleanupList(): Promise<FileListType> {
  const cleanupListPath = path.join(ROOT_DIR, 'docs', 'engineering', 'CLERK_AUTHENTICATION_CLEANUP_LIST.md');
  const fileList: FileListType = {
    toDelete: [],
    toArchive: [],
    toUpdate: [],
  };
  
  try {
    const content = await fs.readFile(cleanupListPath, 'utf8');
    const lines = content.split('\n');
    
    let currentSection = '';
    
    for (const line of lines) {
      if (line.startsWith('## Files to Delete')) {
        currentSection = 'toDelete';
      } else if (line.startsWith('## Files to Archive')) {
        currentSection = 'toArchive';
      } else if (line.startsWith('## Files to Update')) {
        currentSection = 'toUpdate';
      } else if (line.startsWith('1. `') && currentSection) {
        const match = line.match(/`(.*?)`/);
        if (match && match[1]) {
          fileList[currentSection as keyof FileListType].push(match[1]);
        }
      }
    }
  } catch (error) {
    console.error('Error parsing cleanup list:', error);
  }
  
  return fileList;
}

// Generate a detailed report
async function generateReport(findings: FindingType[], fileList: FileListType): Promise<void> {
  // Group findings by file
  const fileGroups = findings.reduce((acc, finding) => {
    if (!acc[finding.file]) {
      acc[finding.file] = [];
    }
    acc[finding.file].push(finding);
    return acc;
  }, {} as Record<string, FindingType[]>);
  
  // Get file stats
  const totalFiles = Object.keys(fileGroups).length;
  const criticalFiles = Object.values(fileGroups).filter(group => 
    group.some(finding => finding.critical)
  ).length;
  
  // Build report content
  let reportContent = `# NextAuth Migration Verification Report\n\n`;
  reportContent += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  reportContent += `## Summary\n\n`;
  reportContent += `- **Total files with NextAuth references:** ${totalFiles}\n`;
  reportContent += `- **Files with critical references:** ${criticalFiles}\n`;
  reportContent += `- **Total findings:** ${findings.length}\n`;
  reportContent += `- **Critical findings:** ${findings.filter(f => f.critical).length}\n\n`;
  
  // Files to delete section
  reportContent += `## Files to Delete\n\n`;
  if (fileList.toDelete.length > 0) {
    for (const file of fileList.toDelete) {
      const exists = await fileExists(path.join(ROOT_DIR, file));
      reportContent += `- ${exists ? '[ ]' : '[x]'} \`${file}\`${exists ? '' : ' (Already deleted)'}\n`;
    }
  } else {
    reportContent += `No files to delete specified in cleanup list.\n`;
  }
  reportContent += `\n`;
  
  // Files to archive section
  reportContent += `## Files to Archive\n\n`;
  if (fileList.toArchive.length > 0) {
    for (const file of fileList.toArchive) {
      const exists = await fileExists(path.join(ROOT_DIR, file));
      const archiveExists = await fileExists(path.join(ROOT_DIR, 'archive', path.basename(file)));
      let status = '';
      if (!exists) {
        status = ' (Not found)';
      } else if (archiveExists) {
        status = ' (Already archived)';
      }
      reportContent += `- [ ] \`${file}\`${status}\n`;
    }
  } else {
    reportContent += `No files to archive specified in cleanup list.\n`;
  }
  reportContent += `\n`;
  
  // Files to update section
  reportContent += `## Files to Update\n\n`;
  if (fileList.toUpdate.length > 0) {
    for (const file of fileList.toUpdate) {
      const exists = await fileExists(path.join(ROOT_DIR, file));
      const hasFindings = fileGroups[path.join(ROOT_DIR, file)];
      let status = '';
      if (!exists) {
        status = ' (Not found)';
      } else if (!hasFindings) {
        status = ' (No NextAuth references found)';
      }
      reportContent += `- [ ] \`${file}\`${status}\n`;
    }
  } else {
    reportContent += `No files to update specified in cleanup list.\n`;
  }
  reportContent += `\n`;
  
  // Detailed findings section
  reportContent += `## Detailed Findings\n\n`;
  
  if (findings.length === 0) {
    reportContent += `No NextAuth references found in the codebase. Migration appears complete!\n`;
  } else {
    // Group by critical vs non-critical
    const criticalFindings = findings.filter(f => f.critical);
    const nonCriticalFindings = findings.filter(f => !f.critical);
    
    // Critical findings
    if (criticalFindings.length > 0) {
      reportContent += `### Critical Findings\n\n`;
      reportContent += `These findings require immediate attention as they affect functionality:\n\n`;
      
      Object.entries(fileGroups)
        .filter(([, group]) => group.some(finding => finding.critical))
        .forEach(([file, group]) => {
          const relativePath = path.relative(ROOT_DIR, file);
          reportContent += `#### ${relativePath}\n\n`;
          
          group
            .filter(finding => finding.critical)
            .forEach(finding => {
              reportContent += `- Line ${finding.line}: ${finding.type} - \`${finding.content}\`\n`;
            });
          
          reportContent += `\n`;
        });
    }
    
    // Non-critical findings
    if (nonCriticalFindings.length > 0) {
      reportContent += `### Non-Critical Findings\n\n`;
      reportContent += `These findings should be reviewed but may not affect functionality:\n\n`;
      
      Object.entries(fileGroups)
        .filter(([, group]) => group.some(finding => !finding.critical))
        .forEach(([file, group]) => {
          const relativePath = path.relative(ROOT_DIR, file);
          reportContent += `#### ${relativePath}\n\n`;
          
          group
            .filter(finding => !finding.critical)
            .forEach(finding => {
              reportContent += `- Line ${finding.line}: ${finding.type} - \`${finding.content}\`\n`;
            });
          
          reportContent += `\n`;
        });
    }
  }
  
  // Add verification checklist
  reportContent += `## Verification Checklist\n\n`;
  reportContent += `- [ ] No imports from \`next-auth\` anywhere in codebase\n`;
  reportContent += `- [ ] No references to NextAuth in documentation (except archive)\n`;
  reportContent += `- [ ] All auth-related tests passing with Clerk mocks\n`;
  reportContent += `- [ ] No NextAuth environment variables in use\n`;
  reportContent += `- [ ] Database schema updated to remove NextAuth tables\n`;
  reportContent += `- [ ] API routes properly protected with Clerk authentication\n`;
  
  // Write the report
  await fs.writeFile(REPORT_PATH, reportContent);
  console.log(`Report generated at ${REPORT_PATH}`);
}

// Helper to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting NextAuth migration verification...');
  
  // Parse cleanup list
  const fileList = await parseCleanupList();
  console.log('Parsed cleanup list');
  
  // Scan codebase for NextAuth references
  console.log('Scanning codebase for NextAuth references...');
  const findings = await scanDir(ROOT_DIR);
  console.log(`Found ${findings.length} NextAuth references in ${Object.keys(findings.reduce((acc, finding) => {
    acc[finding.file] = true;
    return acc;
  }, {} as Record<string, boolean>)).length} files`);
  
  // Generate report
  console.log('Generating report...');
  await generateReport(findings, fileList);
  
  console.log('Verification complete!');
}

// Run the script
main().catch(console.error);