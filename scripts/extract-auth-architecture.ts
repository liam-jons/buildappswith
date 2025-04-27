/**
 * Authentication Architecture Extraction Script for Buildappswith
 * Version: 1.0.121
 * 
 * This script focuses specifically on extracting the authentication architecture,
 * particularly the Clerk implementation that has replaced NextAuth.
 * 
 * Important: This version uses direct TypeScript analysis without structurizr-typescript
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project } from 'ts-morph';
import { extractClerkComponents } from './architecture-utils';

interface AuthComponent {
  name: string;
  path: string;
  type: string;
  description?: string;
  usedBy?: string[];
  dependencies?: string[];
  container?: string; // Added container field to match main architecture extraction
}

interface AuthArchitecture {
  components: AuthComponent[];
  flows: {
    name: string;
    description: string;
    steps: string[];
  }[];
  // Added containers field to match main architecture extraction
  containers: {
    name: string;
    description: string;
    technology: string;
  }[];
}

/**
 * Main function to extract authentication architecture
 */
async function extractAuthArchitecture() {
  console.log('Starting authentication architecture extraction...');
  
  // Initialize TS project
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });
  
  // Add source files to project - expanded to include more auth-related files
  project.addSourceFilesAtPaths([
    './app/(auth)/**/*.{ts,tsx}',
    './components/auth/**/*.{ts,tsx}',
    './lib/auth/**/*.{ts,tsx}',
    './app/api/webhooks/clerk/**/*.{ts,tsx}',
    './middleware.ts',
    './app/api/auth/**/*.{ts,tsx}',
    './components/providers/clerk-provider.tsx',
    './lib/middleware/**/*.{ts,tsx}',
    './lib/clerk/**/*.{ts,tsx}',
    './app/api/*/route.ts',
    './prisma/schema.prisma', // Include schema for auth models
    './schema/auth/**/*.{ts,tsx}' // Include auth schemas
  ]);

  // Define containers based on PRD 2.1
  const containers = [
    {
      name: 'AuthenticationService',
      description: 'Handles user authentication and authorization',
      technology: 'Clerk Authentication'
    },
    {
      name: 'WebApplication',
      description: 'Next.js web application serving the Buildappswith platform',
      technology: 'Next.js 15.3.1 + React 19.1.0 + TypeScript'
    },
    {
      name: 'Database',
      description: 'Stores user data, builder profiles, session information, and learning content',
      technology: 'PostgreSQL + Prisma ORM'
    }
  ];

  // Extract authentication components
  const authComponents = extractAuthComponents(project, containers);
  
  // Identify authentication flows
  const authFlows = identifyAuthFlows();
  
  // Create authentication architecture model
  const authArchitecture: AuthArchitecture = {
    components: authComponents,
    flows: authFlows,
    containers
  };
  
  // Save the extracted architecture
  saveAuthArchitecture(authArchitecture);
  
  // Generate visualization and documentation
  generateAuthMermaidDiagram(authArchitecture);
  generateAuthMarkdownDocs(authArchitecture);
  
  console.log('Authentication architecture extraction completed successfully.');
}

/**
 * Extract authentication components from the project
 */
function extractAuthComponents(project: Project, containers: { name: string; description: string; technology: string }[]): AuthComponent[] {
  const authComponents: AuthComponent[] = [];
  
  // Extract Clerk components
  const clerkComponents = extractClerkComponents(project);
  
  for (const component of clerkComponents) {
    // Read the file to extract description
    const fileContent = fs.readFileSync(component.path, 'utf-8');
    const descriptionMatch = fileContent.match(/\/\*\*\s*\n([^*]|\*[^/])*\*\//);
    const description = descriptionMatch ? descriptionMatch[0].replace(/\/\*\*|\*\//g, '').trim() : undefined;
    
    // Determine container for the component
    let container: string;
    
    if (component.path.includes('/auth/') || 
        component.type === 'Authentication Component' ||
        component.path.includes('clerk')) {
      container = 'AuthenticationService';
    } else if (component.path.includes('.prisma') || component.type === 'Data Model') {
      container = 'Database';
    } else {
      container = 'WebApplication'; // Default container
    }
    
    authComponents.push({
      ...component,
      description,
      container
    });
  }
  
  // Extract Prisma User and authentication models
  try {
    const prismaPath = path.resolve('./prisma/schema.prisma');
    if (fs.existsSync(prismaPath)) {
      const prismaContent = fs.readFileSync(prismaPath, 'utf-8');
      
      // Extract User model
      const userModelMatch = prismaContent.match(/model\s+User\s+{([^}]*)}/);
      if (userModelMatch) {
        authComponents.push({
          name: 'User',
          path: prismaPath,
          type: 'Data Model',
          description: 'User data model with authentication fields',
          container: 'Database'
        });
      }
      
      // Extract Account model
      const accountModelMatch = prismaContent.match(/model\s+Account\s+{([^}]*)}/);
      if (accountModelMatch) {
        authComponents.push({
          name: 'Account',
          path: prismaPath,
          type: 'Data Model',
          description: 'Account data model for authentication providers',
          container: 'Database'
        });
      }
      
      // Extract Session model
      const sessionModelMatch = prismaContent.match(/model\s+Session\s+{([^}]*)}/);
      if (sessionModelMatch) {
        authComponents.push({
          name: 'Session',
          path: prismaPath,
          type: 'Data Model',
          description: 'Session data model for authentication state',
          container: 'Database'
        });
      }
      
      // Extract VerificationToken model
      const verificationTokenModelMatch = prismaContent.match(/model\s+VerificationToken\s+{([^}]*)}/);
      if (verificationTokenModelMatch) {
        authComponents.push({
          name: 'VerificationToken',
          path: prismaPath,
          type: 'Data Model',
          description: 'Verification token model for email verification',
          container: 'Database'
        });
      }
    }
  } catch (error) {
    console.warn('Error processing Prisma schema:', error);
  }
  
  // Extract and add middleware if not already included
  const middlewarePath = path.resolve('./middleware.ts');
  if (fs.existsSync(middlewarePath) && !authComponents.some(c => c.path === middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
    
    if (middlewareContent.includes('@clerk/nextjs') || 
        middlewareContent.includes('auth') || 
        middlewareContent.includes('authentication')) {
      authComponents.push({
        name: 'middleware',
        path: middlewarePath,
        type: 'Middleware',
        description: 'Global middleware handling authentication and authorization',
        container: 'AuthenticationService'
      });
    }
  }
  
  // Find usage relationships between components
  for (const component of authComponents) {
    component.usedBy = [];
    component.dependencies = [];
    
    const componentName = path.basename(component.path, path.extname(component.path));
    
    for (const otherComponent of authComponents) {
      if (otherComponent.path === component.path) continue;
      
      const otherContent = fs.readFileSync(otherComponent.path, 'utf-8');
      const otherName = path.basename(otherComponent.path, path.extname(otherComponent.path));
      
      // Check if other component imports this component
      if (
        otherContent.includes(`from './${componentName}'`) ||
        otherContent.includes(`from "./${componentName}"`) ||
        otherContent.includes(`from '../${componentName}'`) ||
        otherContent.includes(`from "../${componentName}"`) ||
        otherContent.includes(`from '${componentName}'`) ||
        otherContent.includes(`from "${componentName}"`) ||
        otherContent.includes(`import ${componentName}`) ||
        otherContent.includes(`import { ${componentName}`)
      ) {
        component.usedBy!.push(otherName);
        otherComponent.dependencies = otherComponent.dependencies || [];
        otherComponent.dependencies.push(componentName);
      }
    }
  }
  
  return authComponents;
}

/**
 * Identify authentication flows based on known patterns
 */
function identifyAuthFlows() {
  const flows = [
    {
      name: 'Sign-In Flow',
      description: 'Process for authenticating existing users',
      steps: [
        '1. User navigates to /login',
        '2. ClerkProvider initializes authentication state',
        '3. Authentication form collects credentials',
        '4. Credentials are validated by Clerk',
        '5. Upon success, user is redirected to dashboard',
        '6. Middleware verifies authentication on protected routes'
      ]
    },
    {
      name: 'Sign-Up Flow',
      description: 'Process for registering new users',
      steps: [
        '1. User navigates to /signup',
        '2. ClerkProvider initializes registration form',
        '3. User enters registration information',
        '4. Clerk validates and creates user account',
        '5. Webhook receives user.created event',
        '6. Database record is created with clerkId',
        '7. User is redirected to onboarding'
      ]
    },
    {
      name: 'Sign-Out Flow',
      description: 'Process for signing out users',
      steps: [
        '1. User triggers sign-out action',
        '2. Clerk signOut method is called',
        '3. Session is terminated',
        '4. User is redirected to homepage',
        '5. Middleware enforces authentication on subsequent requests'
      ]
    },
    {
      name: 'API Authentication',
      description: 'Process for authenticating API requests',
      steps: [
        '1. Client sends request to API endpoint',
        '2. Middleware intercepts the request',
        '3. Authentication is verified using Clerk',
        '4. If authenticated, request proceeds to API handler',
        '5. API handler uses Clerk currentUser to access user data',
        '6. Response is returned to client'
      ]
    },
    {
      name: 'Role-Based Access Control',
      description: 'Process for enforcing role-based permissions',
      steps: [
        '1. User requests access to protected resource',
        '2. Middleware intercepts the request',
        '3. User roles are retrieved from Clerk publicMetadata',
        '4. Authorization checks verify proper role access',
        '5. Access is granted or denied based on role',
        '6. For API routes, appropriate status codes are returned'
      ]
    }
  ];
  
  return flows;
}

/**
 * Save authentication architecture to files
 */
function saveAuthArchitecture(authArchitecture: AuthArchitecture) {
  const outputDir = './docs/architecture/extraction';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save JSON model
  fs.writeFileSync(
    path.join(outputDir, 'auth-architecture.json'), 
    JSON.stringify(authArchitecture, null, 2)
  );
  
  console.log(`Authentication architecture saved to ${outputDir}`);
}

/**
 * Generate Mermaid diagram for authentication architecture
 */
function generateAuthMermaidDiagram(authArchitecture: AuthArchitecture): void {
  let mermaidCode = 'graph TD\n';
  
  // Add containers as subgraphs
  for (const container of authArchitecture.containers) {
    mermaidCode += `  subgraph ${container.name}\n`;
    
    // Add nodes for components in this container
    for (const component of authArchitecture.components.filter(c => c.container === container.name)) {
      const id = component.name.replace(/[^a-zA-Z0-9]/g, '_');
      mermaidCode += `    ${id}["${component.name} (${component.type})"]:::${getComponentStyle(component.type)}\n`;
    }
    
    mermaidCode += `  end\n\n`;
  }
  
  // Add relationships
  for (const component of authArchitecture.components) {
    if (component.dependencies && component.dependencies.length > 0) {
      const sourceId = component.name.replace(/[^a-zA-Z0-9]/g, '_');
      
      for (const dependency of component.dependencies) {
        const targetId = dependency.replace(/[^a-zA-Z0-9]/g, '_');
        mermaidCode += `  ${sourceId} --> ${targetId}\n`;
      }
    }
  }
  
  // Add container relationships
  mermaidCode += `\n  %% Container relationships\n`;
  mermaidCode += `  WebApplication --> AuthenticationService\n`;
  mermaidCode += `  AuthenticationService --> Database\n`;
  
  // Add style classes
  mermaidCode += '  classDef middleware fill:#FF00FF,color:white;\n';
  mermaidCode += '  classDef auth fill:#00FF80,color:black;\n';
  mermaidCode += '  classDef component fill:#9D00FF,color:white;\n';
  mermaidCode += '  classDef api fill:#00FF00,color:black;\n';
  mermaidCode += '  classDef hook fill:#FF9E00,color:black;\n';
  mermaidCode += '  classDef provider fill:#00FFFF,color:black;\n';
  mermaidCode += '  classDef model fill:#FFFF00,color:black;\n';
  
  // Save Mermaid diagram
  const outputDir = './docs/architecture/extraction';
  const mermaidPath = path.join(outputDir, 'auth-architecture.mmd');
  
  fs.writeFileSync(mermaidPath, mermaidCode);
  
  console.log(`Authentication Mermaid diagram saved to ${mermaidPath}`);
  
  // Generate a flow diagram
  generateAuthFlowDiagram(authArchitecture, outputDir);
}

/**
 * Generate a flowchart for authentication flows
 */
function generateAuthFlowDiagram(authArchitecture: AuthArchitecture, outputDir: string): void {
  // Create a flow diagram for each authentication flow
  for (const flow of authArchitecture.flows) {
    let flowDiagram = `flowchart TD\n    %% ${flow.name}\n    %% ${flow.description}\n\n`;
    
    // Create nodes for each step
    for (let i = 0; i < flow.steps.length; i++) {
      const stepId = `step${i + 1}`;
      const stepText = flow.steps[i].replace(/^\d+\.\s+/, ''); // Remove step number
      
      flowDiagram += `    ${stepId}["${stepText}"]\n`;
      
      // Add connection to next step
      if (i < flow.steps.length - 1) {
        flowDiagram += `    ${stepId} --> step${i + 2}\n`;
      }
    }
    
    // Save flow diagram
    const safeName = flow.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const flowPath = path.join(outputDir, `auth-flow-${safeName}.mmd`);
    fs.writeFileSync(flowPath, flowDiagram);
    
    console.log(`Authentication flow diagram saved to ${flowPath}`);
  }
}

/**
 * Get style class for a component based on its type
 */
function getComponentStyle(type: string): string {
  if (type.includes('Middleware')) return 'middleware';
  if (type.includes('Authentication')) return 'auth';
  if (type.includes('API') || type.includes('Endpoint')) return 'api';
  if (type.includes('Hook')) return 'hook';
  if (type.includes('Provider')) return 'provider';
  if (type.includes('Model')) return 'model';
  return 'component';
}

/**
 * Generate Markdown documentation for authentication architecture
 */
function generateAuthMarkdownDocs(authArchitecture: AuthArchitecture): string {
  let markdown = '# Authentication Architecture\n\n';
  
  // Overview
  markdown += '## Overview\n\n';
  markdown += 'The Buildappswith platform uses Clerk for authentication and user management. ';
  markdown += 'This document describes the authentication architecture and components based on PRD 2.1.\n\n';
  
  // Containers
  markdown += '## Authentication Containers\n\n';
  markdown += '| Container | Description | Technology |\n';
  markdown += '|-----------|-------------|------------|\n';
  
  for (const container of authArchitecture.containers) {
    markdown += `| ${container.name} | ${container.description} | ${container.technology} |\n`;
  }
  
  markdown += '\n';
  
  // Components by Container
  markdown += '## Authentication Components by Container\n\n';
  
  for (const container of authArchitecture.containers) {
    markdown += `### ${container.name}\n\n`;
    
    const containerComponents = authArchitecture.components.filter(c => c.container === container.name);
    
    if (containerComponents.length === 0) {
      markdown += 'No components found in this container.\n\n';
      continue;
    }
    
    markdown += '| Component | Type | Description |\n';
    markdown += '|-----------|------|-------------|\n';
    
    for (const component of containerComponents) {
      markdown += `| ${component.name} | ${component.type} | ${component.description || 'N/A'} |\n`;
    }
    
    markdown += '\n';
  }
  
  // Flows
  markdown += '## Authentication Flows\n\n';
  
  for (const flow of authArchitecture.flows) {
    markdown += `### ${flow.name}\n\n`;
    markdown += `${flow.description}\n\n`;
    
    for (const step of flow.steps) {
      markdown += `${step}\n`;
    }
    
    markdown += '\n';
  }
  
  // Component Dependencies
  markdown += '## Component Dependencies\n\n';
  
  for (const component of authArchitecture.components) {
    markdown += `### ${component.name}\n\n`;
    
    if (component.dependencies && component.dependencies.length > 0) {
      markdown += 'Dependencies:\n';
      
      for (const dependency of component.dependencies) {
        markdown += `- ${dependency}\n`;
      }
      
      markdown += '\n';
    }
    
    if (component.usedBy && component.usedBy.length > 0) {
      markdown += 'Used by:\n';
      
      for (const user of component.usedBy) {
        markdown += `- ${user}\n`;
      }
      
      markdown += '\n';
    }
  }
  
  // NextAuth to Clerk Migration Section
  markdown += '## NextAuth to Clerk Migration\n\n';
  markdown += 'The authentication system has been successfully migrated from NextAuth.js to Clerk. ';
  markdown += 'This migration provides several benefits:\n\n';
  
  markdown += '- Enhanced security features\n';
  markdown += '- Improved user management capabilities\n';
  markdown += '- Better multi-tenant support\n';
  markdown += '- Simplified role-based access control\n';
  markdown += '- Webhook integration for authentication events\n\n';
  
  markdown += 'The migration involved:\n\n';
  
  markdown += '1. Adding Clerk Provider to wrap application\n';
  markdown += '2. Implementing Clerk middleware for route protection\n';
  markdown += '3. Setting up webhook handlers for authentication events\n';
  markdown += '4. Creating database synchronization for user data\n';
  markdown += '5. Updating protected routes and components\n';
  markdown += '6. Implementing role-based access control using Clerk metadata\n\n';
  
  // Save markdown documentation
  const outputDir = './docs/architecture/extraction';
  const markdownPath = path.join(outputDir, 'auth-architecture.md');
  fs.writeFileSync(markdownPath, markdown);
  
  console.log(`Authentication documentation saved to ${markdownPath}`);
  
  return markdown;
}

// Run the extraction
extractAuthArchitecture().catch(error => {
  console.error('Error during authentication architecture extraction:', error);
  process.exit(1);
});