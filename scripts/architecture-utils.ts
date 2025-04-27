/**
 * Architecture Extraction Utilities for Buildappswith
 * Version: 1.0.124
 * 
 * This file contains utility functions for architecture extraction and analysis.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile } from 'ts-morph';

// Types of components we want to extract
export const ComponentTypes = {
  PAGE: 'Page Component',
  API_ROUTE: 'API Endpoint',
  UI_COMPONENT: 'UI Component',
  HOOK: 'Hook',
  UTILITY: 'Utility',
  CONTEXT: 'Context Provider',
  MODEL: 'Data Model',
  MIDDLEWARE: 'Middleware',
  SERVICE: 'Service',
  AUTHENTICATION: 'Authentication Component'
};

// Indicators of technical debt in code
export const TechnicalDebtIndicators = [
  '@deprecated',
  'TODO:',
  'FIXME:',
  'HACK:',
  'XXX:',
  'BUG:',
  '// Legacy',
  '/* Legacy',
  '// Temporary',
  '/* Temporary',
  '// Workaround',
  '/* Workaround'
];

// Indicators of legacy code - more precise patterns for better detection
export const LegacyCodeIndicators = {
  // NextAuth (replaced by Clerk) - more specific patterns to avoid false positives
  NEXTAUTH: [
    'from "next-auth"', 
    "from 'next-auth'",
    'import { getSession }',
    'import { useSession }',
    'import { signIn as nextAuthSignIn',
    'import { signOut as nextAuthSignOut',
    'import NextAuth',
    'import { NextAuthProvider',
    'import { SessionProvider',
    'export { getSession',
    'export { useSession',
    'NextAuth.js',
    'NextAuth('
  ],
  // Booking system legacy components
  BOOKING_LEGACY: [
    '// Legacy booking system',
    '/* Legacy booking system',
    'Pre-Clerk booking implementation',
    'Temporary booking implementation'
  ],
  // Session types legacy indicators
  SESSION_LEGACY: [
    '// Legacy session types',
    '/* Legacy session types',
    'Temporary session implementation',
    'using NextAuthSession'
  ]
};

/**
 * Get the current timestamp for file naming
 * Uses environment variable if available, otherwise generates a new timestamp
 */
export function getTimestamp(): string {
  // Use environment variable if available (set by run-architecture-extraction.sh)
  if (process.env.EXTRACTION_TIMESTAMP) {
    return process.env.EXTRACTION_TIMESTAMP;
  }
  
  // Otherwise generate a new timestamp
  return new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
}

/**
 * Create a timestamped filename
 */
export function createTimestampedFilename(baseFilename: string): string {
  const timestamp = getTimestamp();
  const extension = path.extname(baseFilename);
  const basename = path.basename(baseFilename, extension);
  
  // Skip if the filename already has a timestamp pattern
  if (basename.match(/\d{4}-\d{2}-\d{2}/)) {
    return baseFilename;
  }
  
  return `${basename}-${timestamp}${extension}`;
}

/**
 * Determine if a file or component has technical debt
 */
export function hasTechnicalDebt(fileContent: string): boolean {
  return TechnicalDebtIndicators.some(indicator => fileContent.includes(indicator));
}

/**
 * Determine if a file or component is using legacy code
 * Enhanced to be more precise about what constitutes legacy code
 */
export function isLegacyCode(fileContent: string, filePath: string): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  
  // Check for explicit version updates that indicate no longer legacy
  const isRecentlyUpdated = fileContent.includes('@version 1.0.108') || 
                            fileContent.includes('@version 1.0.109') || 
                            fileContent.includes('@version 1.0.110') || 
                            fileContent.includes('@version 1.0.111') ||
                            fileContent.includes('@version 1.0.112') ||
                            fileContent.includes('@version 1.0.113') ||
                            fileContent.includes('@version 1.0.114') ||
                            fileContent.includes('@version 1.0.115') ||
                            fileContent.includes('@version 1.0.116') ||
                            fileContent.includes('@version 1.0.117') ||
                            fileContent.includes('@version 1.0.118') ||
                            fileContent.includes('@version 1.0.119') ||
                            fileContent.includes('@version 1.0.120') ||
                            fileContent.includes('@version 1.0.121') ||
                            fileContent.includes('@version 1.0.122') ||
                            fileContent.includes('@version 1.0.123') ||
                            fileContent.includes('@version 1.0.124');
  
  // If explicitly marked as updated version, don't consider it legacy
  if (isRecentlyUpdated) {
    for (const key of Object.keys(LegacyCodeIndicators)) {
      result[key] = false;
    }
    return result;
  }
  
  // Specific check for auth components - if using proper Clerk patterns, not legacy
  if (
    (filePath.includes('/auth/') || filePath.includes('auth-provider') || filePath.includes('login-button')) && 
    (fileContent.includes('from "@clerk/nextjs"') || fileContent.includes("from '@clerk/nextjs'")) &&
    !LegacyCodeIndicators.NEXTAUTH.some(indicator => fileContent.includes(indicator))
  ) {
    result['NEXTAUTH'] = false;
  } else {
    // Check against legacy indicators
    for (const [key, indicators] of Object.entries(LegacyCodeIndicators)) {
      result[key] = indicators.some(indicator => fileContent.includes(indicator));
    }
  }
  
  return result;
}

/**
 * Determine component type based on file path and content
 */
export function determineComponentType(filePath: string, fileContent: string): string {
  // Page components
  if (filePath.includes('/app/') && (filePath.includes('page.tsx') || filePath.includes('layout.tsx'))) {
    return ComponentTypes.PAGE;
  }
  
  // API routes
  if (filePath.includes('/api/') && (filePath.includes('route.ts') || filePath.includes('route.js'))) {
    return ComponentTypes.API_ROUTE;
  }
  
  // UI components
  if (filePath.includes('/components/') && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) {
    // Check if it's a context provider
    if (fileContent.includes('createContext') || filePath.includes('provider') || fileContent.includes('Provider')) {
      return ComponentTypes.CONTEXT;
    }
    
    return ComponentTypes.UI_COMPONENT;
  }
  
  // Hooks
  if ((filePath.includes('/hooks/') || filePath.match(/use[A-Z]/)) && fileContent.includes('function use')) {
    return ComponentTypes.HOOK;
  }
  
  // Authentication components
  if (
    filePath.includes('/auth/') || 
    fileContent.includes('@clerk/') || 
    filePath.includes('middleware') && fileContent.includes('auth')
  ) {
    return ComponentTypes.AUTHENTICATION;
  }
  
  // Middleware
  if (filePath.includes('middleware')) {
    return ComponentTypes.MIDDLEWARE;
  }
  
  // Services (typically interact with external APIs/systems)
  if (filePath.includes('/services/') || fileContent.includes('fetch(') || fileContent.includes('axios.')) {
    return ComponentTypes.SERVICE;
  }
  
  // Models
  if (filePath.includes('/models/') || filePath.includes('schema.prisma')) {
    return ComponentTypes.MODEL;
  }
  
  // Default to utility
  return ComponentTypes.UTILITY;
}

/**
 * Find all references to a component in the project
 */
export function findReferences(project: Project, componentName: string): SourceFile[] {
  const references: SourceFile[] = [];
  
  for (const sourceFile of project.getSourceFiles()) {
    // Skip the component file itself
    if (path.basename(sourceFile.getFilePath(), path.extname(sourceFile.getFilePath())) === componentName) {
      continue;
    }
    
    // Check import declarations
    const hasReference = sourceFile.getImportDeclarations().some(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      return moduleSpecifier.endsWith(`/${componentName}`) || 
             moduleSpecifier === `./${componentName}` ||
             moduleSpecifier === componentName;
    });
    
    if (hasReference) {
      references.push(sourceFile);
    }
  }
  
  return references;
}

/**
 * Generate a color for a component based on its type and properties
 */
export function generateComponentColor(componentType: string, isTechnicalDebt: boolean, isLegacy: boolean): string {
  // Base colors for component types
  const typeColors: Record<string, string> = {
    [ComponentTypes.PAGE]: '#0000FF',           // Blue
    [ComponentTypes.API_ROUTE]: '#00FF00',      // Green
    [ComponentTypes.UI_COMPONENT]: '#9D00FF',   // Purple
    [ComponentTypes.HOOK]: '#FF9E00',           // Orange
    [ComponentTypes.UTILITY]: '#808080',        // Gray
    [ComponentTypes.CONTEXT]: '#00FFFF',        // Cyan
    [ComponentTypes.MODEL]: '#FFFF00',          // Yellow
    [ComponentTypes.MIDDLEWARE]: '#FF00FF',     // Magenta
    [ComponentTypes.SERVICE]: '#FFC0CB',        // Pink
    [ComponentTypes.AUTHENTICATION]: '#00FF80'  // Teal
  };
  
  // If technical debt, use red
  if (isTechnicalDebt) {
    return '#FF0000'; // Red
  }
  
  // If legacy code, use orange
  if (isLegacy) {
    return '#FF9900'; // Orange
  }
  
  // Otherwise, use the type color
  return typeColors[componentType] || '#000000'; // Black (default)
}

/**
 * Extract clerk-related components specifically
 */
export function extractClerkComponents(project: Project): {name: string, path: string, type: string}[] {
  const clerkComponents: {name: string, path: string, type: string}[] = [];
  
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    const fileContent = sourceFile.getFullText();
    
    // Skip test files
    if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
      continue;
    }
    
    // Check if file uses Clerk
    if (
      fileContent.includes('from "@clerk/') ||
      fileContent.includes("from '@clerk/") ||
      fileContent.includes('currentUser') ||
      fileContent.includes('ClerkProvider') ||
      fileContent.includes('useAuth') ||
      fileContent.includes('useUser')
    ) {
      const name = path.basename(filePath, path.extname(filePath));
      const type = determineComponentType(filePath, fileContent);
      
      clerkComponents.push({
        name,
        path: filePath,
        type: type === ComponentTypes.AUTHENTICATION ? type : `${type} (Clerk)`
      });
    }
  }
  
  return clerkComponents;
}

/**
 * Generate NextAuth to Clerk migration status report
 */
export function generateNextAuthMigrationReport(components: any[]): string {
  // Find components that are part of the migration
  const migrationComponents = components.filter(c => {
    // Check if it's an auth component or uses clerk
    const isAuthComponent = 
      c.path.includes('/auth/') || 
      c.path.includes('auth-provider') || 
      c.path.includes('login-button') ||
      c.path.includes('user-profile') ||
      (c.type === ComponentTypes.AUTHENTICATION || c.type.includes('(Clerk)'));
    
    // Check if it's marked as NextAuth legacy
    const isNextAuthLegacy = c.legacyTypes && c.legacyTypes.NEXTAUTH;
    
    return isAuthComponent && isNextAuthLegacy;
  });
  
  let report = '';
  
  // Only add the migration section if there are legacy NextAuth components
  if (migrationComponents.length > 0) {
    report += '## NextAuth Legacy Migration Status\n\n';
    report += 'The application is in the process of migrating from NextAuth.js to Clerk for authentication. The following components are part of this migration:\n\n';
    report += '| Component | Type | Container | Path |\n';
    report += '|-----------|------|-----------|------|\n';
    
    for (const component of migrationComponents) {
      report += `| ${component.name} | ${component.type} | ${component.container} | ${component.path} |\n`;
    }
    
    report += '\n';
  }
  
  return report;
}

/**
 * Create a Mermaid diagram for technical debt and legacy code visualization
 */
export function generateTechnicalDebtMermaid(components: any[]): string {
  let mermaidCode = 'graph TD\n';
  
  // Add nodes
  for (const component of components) {
    if (component.isTechnicalDebt || component.isLegacy) {
      const id = component.name.replace(/[^a-zA-Z0-9]/g, '_');
      const label = `${component.name} (${component.type})`;
      const style = component.isTechnicalDebt ? 'fill:#FF0000,color:white' : 'fill:#FF9900,color:white';
      
      mermaidCode += `    ${id}["${label}"]:::${component.isTechnicalDebt ? 'technicalDebt' : 'legacy'}\n`;
    }
  }
  
  // Add relationships
  for (const rel of components.filter(c => c.isTechnicalDebt || c.isLegacy)) {
    for (const dep of rel.dependencies || []) {
      const depComponent = components.find(c => c.name === dep);
      
      if (depComponent && (depComponent.isTechnicalDebt || depComponent.isLegacy)) {
        const sourceId = rel.name.replace(/[^a-zA-Z0-9]/g, '_');
        const targetId = dep.replace(/[^a-zA-Z0-9]/g, '_');
        
        mermaidCode += `    ${sourceId} --> ${targetId}\n`;
      }
    }
  }
  
  // Add class definitions
  mermaidCode += '    classDef technicalDebt fill:#FF0000,color:white;\n';
  mermaidCode += '    classDef legacy fill:#FF9900,color:white;\n';
  
  return mermaidCode;
}

/**
 * Generate a report of technical debt and legacy code
 */
export function generateTechnicalDebtReport(components: any[]): string {
  const technicalDebtComponents = components.filter(c => c.isTechnicalDebt);
  const legacyComponents = components.filter(c => c.isLegacy);
  
  const timestamp = new Date().toLocaleDateString();
  
  let report = '# Technical Debt and Legacy Components Report\n\n';
  report += `*Generated on: ${timestamp}*\n\n`;
  
  // Technical Debt section
  report += '## Technical Debt Components\n\n';
  
  if (technicalDebtComponents.length === 0) {
    report += 'No technical debt components identified.\n\n';
  } else {
    report += '| Component | Type | Container | Path |\n';
    report += '|-----------|------|-----------|------|\n';
    
    for (const component of technicalDebtComponents) {
      report += `| ${component.name} | ${component.type} | ${component.container} | ${component.path} |\n`;
    }
    
    report += '\n';
  }
  
  // Legacy Code section
  report += '## Legacy Components\n\n';
  
  if (legacyComponents.length === 0) {
    report += 'No legacy components identified.\n\n';
  } else {
    report += '| Component | Type | Container | Path |\n';
    report += '|-----------|------|-----------|------|\n';
    
    for (const component of legacyComponents) {
      report += `| ${component.name} | ${component.type} | ${component.container} | ${component.path} |\n`;
    }
    
    report += '\n';
  }
  
  // If there are NextAuth legacy components, add the migration section
  report += generateNextAuthMigrationReport(components);
  
  return report;
}

/**
 * Save file with timestamp in the filename
 */
export function saveWithTimestamp(outputDir: string, baseFilename: string, content: string): string {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create timestamped filename
  const timestampedFilename = createTimestampedFilename(baseFilename);
  const outputPath = path.join(outputDir, timestampedFilename);
  
  // Write file with timestamped name
  fs.writeFileSync(outputPath, content);
  
  // Also save with standard name for backward compatibility
  const standardPath = path.join(outputDir, baseFilename);
  fs.writeFileSync(standardPath, content);
  
  return outputPath;
}
