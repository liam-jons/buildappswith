/**
 * Architecture Extraction Script for Buildappswith
 * Version: 1.0.4
 * 
 * This script extracts the architecture from the TypeScript/Next.js codebase
 * and updates the Structurizr workspace with the extracted components.
 * 
 * Important: This version uses direct TypeScript analysis without structurizr-typescript
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile } from 'ts-morph';
import { 
  hasTechnicalDebt, 
  isLegacyCode, 
  determineComponentType, 
  getTimestamp,
  createTimestampedFilename,
  saveWithTimestamp,
  generateTechnicalDebtReport,
  generateTechnicalDebtMermaid
} from './architecture-utils';

// Mapping between directories and component types
const COMPONENT_TYPE_MAPPING: Record<string, string> = {
  'components': 'UI Component',
  'app': 'Page Component',
  'lib': 'Library',
  'hooks': 'Hook',
  'api': 'API Endpoint',
  'middleware': 'Middleware',
  'prisma': 'Data Model',
  'types': 'Type Definition',
  'schema': 'Schema',
  'services': 'Service',
  'providers': 'Context Provider',
  'utils': 'Utility'
};

// Directories to exclude from extraction
const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  'public',
  'test-results',
  '__tests__',
  '__mocks__'
];

interface Component {
  name: string;
  type: string;
  path: string;
  dependencies: string[];
  isLegacy?: boolean;
  isTechnicalDebt?: boolean;
  container?: string; // Added container field to organize components
}

interface ArchitectureModel {
  components: Component[];
  relationships: {
    source: string;
    target: string;
    description: string;
  }[];
  // Added containers field to organize components
  containers: {
    name: string;
    description: string;
    technology: string;
  }[];
}

/**
 * Main function to extract architecture
 */
async function extractArchitecture() {
  console.log('Starting architecture extraction...');
  
  // Initialize TS project
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });
  
  // Add source files to project - expanded pattern list
  project.addSourceFilesAtPaths([
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './middleware.ts',
    './prisma/**/*.{ts,prisma}',
    './schema/**/*.{ts,tsx}',
    './types/**/*.{ts,tsx}',
    './styles/**/*.{css,scss}',
    './config/**/*.{ts,js}',
    './utils/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './api/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}'
  ]);

  // Extract components and relationships
  const model = extractComponentsAndRelationships(project);
  
  // Analyze for technical debt and legacy code
  analyzeForTechnicalDebt(model);
  
  // Save the extracted model to a JSON file
  saveExtractedModel(model);
  
  // Generate DSL for Structurizr
  generateStructurizrDSL(model);
  
  // Generate Mermaid diagrams for visualization
  generateMermaidDiagram(model);
  
  // Generate technical debt visualization
  generateTechnicalDebtVisualization(model);
  
  console.log('Architecture extraction completed successfully.');
}

/**
 * Extract components and their relationships from the project
 */
function extractComponentsAndRelationships(project: Project): ArchitectureModel {
  const components: Component[] = [];
  const relationshipMap = new Map<string, Map<string, string>>();
  
  // Define containers based on PRD 2.1
  const containers = [
    {
      name: 'WebApplication',
      description: 'Next.js web application serving the Buildappswith platform',
      technology: 'Next.js 15.3.1 + React 19.1.0 + TypeScript'
    },
    {
      name: 'Database',
      description: 'Stores user data, builder profiles, session information, and learning content',
      technology: 'PostgreSQL + Prisma ORM'
    },
    {
      name: 'AuthenticationService',
      description: 'Handles user authentication and authorization',
      technology: 'Clerk Authentication'
    },
    {
      name: 'PaymentService',
      description: 'Processes payments for sessions',
      technology: 'Stripe API'
    },
    {
      name: 'BookingSystem',
      description: 'Manages session scheduling and availability',
      technology: 'Custom calendar integration'
    }
  ];
  
  // Extract components
  const sourceFiles = project.getSourceFiles();
  console.log(`Processing ${sourceFiles.length} source files...`);
  
  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    
    // Skip excluded directories
    if (EXCLUDED_DIRS.some(dir => filePath.includes(dir))) {
      continue;
    }
    
    const componentName = getComponentName(sourceFile);
    const fileContent = sourceFile.getFullText();
    const componentType = determineComponentType(filePath, fileContent);
    
    // Determine container for component
    let container: string | undefined = undefined;
    
    if (filePath.includes('.prisma') || componentType === 'Data Model') {
      container = 'Database';
    } else if (filePath.includes('/auth/') || componentType === 'Authentication Component') {
      container = 'AuthenticationService';
    } else if (filePath.includes('stripe') || filePath.includes('payment')) {
      container = 'PaymentService';
    } else if (filePath.includes('booking') || filePath.includes('schedule') || filePath.includes('calendar')) {
      container = 'BookingSystem';
    } else {
      container = 'WebApplication'; // Default container
    }
    
    // Extract imports to determine dependencies
    const importDeclarations = sourceFile.getImportDeclarations();
    const dependencies: string[] = [];
    
    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      // Skip external dependencies
      if (moduleSpecifier.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(filePath), moduleSpecifier);
        const resolvedComponent = findComponentByPath(sourceFiles, resolvedPath);
        
        if (resolvedComponent) {
          dependencies.push(resolvedComponent);
          
          // Record relationship
          if (!relationshipMap.has(componentName)) {
            relationshipMap.set(componentName, new Map<string, string>());
          }
          relationshipMap.get(componentName)!.set(resolvedComponent, 'Uses');
        }
      }
    }
    
    // Add component to the list
    components.push({
      name: componentName,
      type: componentType,
      path: filePath,
      dependencies,
      container
    });
  }
  
  // Extract Prisma schema components if not already included
  try {
    const prismaSchema = fs.readFileSync('./prisma/schema.prisma', 'utf-8');
    
    // Extract model definitions
    const modelRegex = /model\s+(\w+)\s+{([^}]*)}/g;
    let match;
    
    while ((match = modelRegex.exec(prismaSchema)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      
      // Skip if model component already exists
      if (components.some(c => c.name === modelName)) {
        continue;
      }
      
      // Add model component
      components.push({
        name: modelName,
        type: 'Data Model',
        path: './prisma/schema.prisma',
        dependencies: [],
        container: 'Database'
      });
      
      // Extract relations to determine dependencies
      const relationRegex = /@relation\s*\(\s*fields\s*:\s*\[([^\]]+)\]\s*,\s*references\s*:\s*\[([^\]]+)\]\s*,?[^)]*\)/g;
      const relationFields: Record<string, string> = {};
      
      let relationMatch;
      while ((relationMatch = relationRegex.exec(modelBody)) !== null) {
        const localField = relationMatch[1].trim();
        const foreignField = relationMatch[2].trim();
        
        // Extract the related model
        const fieldRegex = new RegExp(`${localField}\\s+([^\\s]+)`, 'g');
        const fieldMatch = fieldRegex.exec(modelBody);
        
        if (fieldMatch) {
          const fieldType = fieldMatch[1];
          // Clean up type name (remove [] and ? for arrays and optionals)
          const relatedModel = fieldType.replace(/[\[\]?]/g, '');
          
          // Add relationship
          if (!relationshipMap.has(modelName)) {
            relationshipMap.set(modelName, new Map<string, string>());
          }
          relationshipMap.get(modelName)!.set(relatedModel, 'References');
          
          // Add to dependencies
          if (!components.some(c => c.name === modelName)) {
            continue;
          }
          
          const component = components.find(c => c.name === modelName);
          if (component && !component.dependencies.includes(relatedModel)) {
            component.dependencies.push(relatedModel);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error processing Prisma schema:', error);
  }
  
  // Convert relationship map to array
  const relationships: { source: string; target: string; description: string }[] = [];
  
  relationshipMap.forEach((targetMap, source) => {
    targetMap.forEach((description, target) => {
      relationships.push({
        source,
        target,
        description
      });
    });
  });
  
  return { components, relationships, containers };
}

/**
 * Get component name from source file
 */
function getComponentName(sourceFile: SourceFile): string {
  const fileName = path.basename(sourceFile.getFilePath());
  return path.parse(fileName).name;
}

/**
 * Find component by path
 */
function findComponentByPath(sourceFiles: SourceFile[], targetPath: string): string | null {
  // Handle both with and without extension
  const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx'];
  
  for (const extension of possibleExtensions) {
    const pathWithExtension = `${targetPath}${extension}`;
    
    const sourceFile = sourceFiles.find(sf => {
      return sf.getFilePath() === pathWithExtension;
    });
    
    if (sourceFile) {
      return getComponentName(sourceFile);
    }
  }
  
  // Handle index files
  for (const extension of possibleExtensions) {
    const indexPath = path.join(targetPath, `index${extension}`);
    
    const sourceFile = sourceFiles.find(sf => {
      return sf.getFilePath() === indexPath;
    });
    
    if (sourceFile) {
      return getComponentName(sourceFile);
    }
  }
  
  return null;
}

/**
 * Analyze for technical debt and legacy code
 */
function analyzeForTechnicalDebt(model: ArchitectureModel): void {
  console.log('Analyzing for technical debt and legacy code...');
  
  // Look for components with legacy or technical debt indicators
  for (const component of model.components) {
    const content = fs.readFileSync(component.path, 'utf-8');
    
    // Check for technical debt indicators
    component.isTechnicalDebt = hasTechnicalDebt(content);
    
    // Check for legacy code indicators (particularly NextAuth)
    // Pass both content and file path to isLegacyCode
    const legacyResults = isLegacyCode(content, component.path);
    component.isLegacy = Object.values(legacyResults).some(Boolean);
  }
}

/**
 * Save extracted model to a JSON file
 */
function saveExtractedModel(model: ArchitectureModel): void {
  const outputDir = './docs/architecture/extraction';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save model with timestamp using centralized function
  const outputPath = saveWithTimestamp(
    outputDir, 
    'extracted-model.json', 
    JSON.stringify(model, null, 2)
  );
  
  console.log(`Extracted model saved to ${outputPath}`);
}

/**
 * Generate DSL for Structurizr
 * This function directly generates DSL content instead of using the structurizr-typescript package
 */
function generateStructurizrDSL(model: ArchitectureModel): void {
  console.log('Generating Structurizr DSL...');
  
  const workspaceDslPath = './docs/architecture/structurizr/workspace.dsl';
  
  // Check if workspace.dsl exists
  if (!fs.existsSync(workspaceDslPath)) {
    console.log('Workspace DSL file not found. Creating a basic structure...');
    createBasicWorkspaceDSL(workspaceDslPath);
  }
  
  // Create a new workspace DSL with proper component nesting
  let newWorkspaceDsl = createWorkspaceDSL(model);
  
  // Write the new workspace DSL to file
  fs.writeFileSync(workspaceDslPath, newWorkspaceDsl);
  
  console.log('Structurizr workspace updated successfully');
}

/**
 * Create a new Structurizr workspace DSL based on the PRD 2.1
 */
function createWorkspaceDSL(model: ArchitectureModel): string {
  // Group components by container
  const containerComponents: Record<string, Component[]> = {};
  
  for (const container of model.containers) {
    containerComponents[container.name] = [];
  }
  
  for (const component of model.components) {
    if (component.container && containerComponents[component.container]) {
      containerComponents[component.container].push(component);
    } else {
      // Default to WebApplication for components without a container
      containerComponents['WebApplication'] = containerComponents['WebApplication'] || [];
      containerComponents['WebApplication'].push(component);
    }
  }
  
  // Start building DSL
  let dsl = `workspace "Buildappswith Platform" "Architecture documentation for the Buildappswith platform using the C4 model" {

    !adrs decisions
    !docs documentation

    model {
        // People/Actors
        client = person "Client" "A small business owner or individual seeking to create an AI application"
        learner = person "Learner" "An individual looking to develop AI literacy and application skills"
        builder = person "Builder" "An experienced developer offering AI application development services"
        admin = person "Administrator" "Platform administrator managing the Buildappswith ecosystem"

        // Software Systems
        buildappswith = softwareSystem "Buildappswith Platform" "A platform that democratizes AI application development through marketplace and educational resources" {
            // Containers\n`;
  
  // Add containers
  for (const container of model.containers) {
    dsl += `            ${container.name.toLowerCase()} = container "${container.name}" "${container.description}" "${container.technology}"\n`;
  }
  
  // Add components within containers
  for (const container of model.containers) {
    const components = containerComponents[container.name] || [];
    
    if (components.length > 0) {
      dsl += `\n            // Components in ${container.name}\n`;
      dsl += `            ${container.name.toLowerCase()} {\n`;
      
      // Add component definitions
      for (const component of components) {
        const tags = [];
        
        if (component.isTechnicalDebt) {
          tags.push('Technical Debt');
        }
        
        if (component.isLegacy) {
          tags.push('Legacy');
        }
        
        const tagsStr = tags.length > 0 ? ` tags "${tags.join(',')}"` : '';
        
        dsl += `                ${component.name.replace(/[^a-zA-Z0-9]/g, '_')} = component "${component.name}" "${component.type}"${tagsStr}\n`;
      }
      
      dsl += `            }\n`;
    }
  }
  
  // Add relationships
  dsl += `\n            // Relationships between components\n`;
  
  for (const rel of model.relationships) {
    const sourceVar = rel.source.replace(/[^a-zA-Z0-9]/g, '_');
    const targetVar = rel.target.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Determine the containers for source and target
    const sourceComponent = model.components.find(c => c.name === rel.source);
    const targetComponent = model.components.find(c => c.name === rel.target);
    
    if (sourceComponent && targetComponent) {
      // Only add the relationship if both components are in the model
      dsl += `            ${sourceVar} -> ${targetVar} "${rel.description}"\n`;
    }
  }
  
  // Add relationships between containers
  dsl += `\n            // Relationships between containers\n`;
  dsl += `            webapplication -> database "Reads from and writes to" "SQL/TCP"\n`;
  dsl += `            webapplication -> authenticationservice "Authenticates users via" "JSON/HTTP"\n`;
  dsl += `            webapplication -> paymentservice "Processes payments via" "JSON/HTTP"\n`;
  dsl += `            webapplication -> bookingsystem "Manages bookings via" "JSON/HTTP"\n`;
  
  // Close system and model
  dsl += `        }

        // External Systems
        aiTools = softwareSystem "External AI Tools" "Third-party AI tools and platforms recommended by Buildappswith" "External System"
        email = softwareSystem "Email System" "System for sending emails to users" "External System"

        // Relationships between people and systems
        client -> buildappswith "Uses to commission AI applications"
        learner -> buildappswith "Uses to learn AI application development"
        builder -> buildappswith "Uses to offer services and showcase expertise"
        admin -> buildappswith "Manages and monitors"
        
        buildappswith -> aiTools "Recommends and integrates with"
        buildappswith -> email "Sends emails via"
    }

    views {
        systemContext buildappswith "SystemContext" {
            include *
            autoLayout
        }

        container buildappswith "Containers" {
            include *
            autoLayout
        }\n`;
  
  // Add component views for each container
  for (const container of model.containers) {
    dsl += `
        component ${container.name.toLowerCase()} "${container.name}" {
            include *
            autoLayout
        }\n`;
  }
  
  // Add styles and close workspace
  dsl += `
        theme default
        
        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
            }
            element "Database" {
                shape Cylinder
            }
            element "External Service" {
                background #999999
            }
            element "External System" {
                background #999999
            }
            element "Technical Debt" {
                background #ff9800
                color #ffffff
            }
            element "Legacy" {
                background #f44336
                color #ffffff
            }
        }
    }
}`;
  
  return dsl;
}

/**
 * Create a basic Structurizr workspace.dsl file if none exists
 */
function createBasicWorkspaceDSL(filePath: string): void {
  const basicDSL = `workspace "Buildappswith Platform" "Architecture documentation for the Buildappswith platform using the C4 model" {

    !adrs decisions
    !docs documentation

    model {
        // People/Actors
        client = person "Client" "A small business owner or individual seeking to create an AI application"
        learner = person "Learner" "An individual looking to develop AI literacy and application skills"
        builder = person "Builder" "An experienced developer offering AI application development services"
        admin = person "Administrator" "Platform administrator managing the Buildappswith ecosystem"

        // Software Systems
        buildappswith = softwareSystem "Buildappswith Platform" "A platform that democratizes AI application development through marketplace and educational resources" {
            // Containers
            webapplication = container "WebApplication" "Next.js web application serving the Buildappswith platform" "Next.js 15.3.1 + React 19.1.0 + TypeScript"
            database = container "Database" "Stores user data, builder profiles, session information, and learning content" "PostgreSQL + Prisma ORM"
            authenticationservice = container "AuthenticationService" "Handles user authentication and authorization" "Clerk Authentication"
            paymentservice = container "PaymentService" "Processes payments for sessions" "Stripe API"
            bookingsystem = container "BookingSystem" "Manages session scheduling and availability" "Custom calendar integration"
            
            // Components will be added here by extraction
        }

        // External Systems
        aiTools = softwareSystem "External AI Tools" "Third-party AI tools and platforms recommended by Buildappswith" "External System"
        email = softwareSystem "Email System" "System for sending emails to users" "External System"

        // Relationships between people and systems
        client -> buildappswith "Uses to commission AI applications"
        learner -> buildappswith "Uses to learn AI application development"
        builder -> buildappswith "Uses to offer services and showcase expertise"
        admin -> buildappswith "Manages and monitors"
        
        buildappswith -> aiTools "Recommends and integrates with"
        buildappswith -> email "Sends emails via"
    }

    views {
        systemContext buildappswith "SystemContext" {
            include *
            autoLayout
        }

        container buildappswith "Containers" {
            include *
            autoLayout
        }
        
        theme default
        
        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
            }
            element "Database" {
                shape Cylinder
            }
            element "External Service" {
                background #999999
            }
            element "External System" {
                background #999999
            }
        }
    }
}`;

  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write basic DSL to file
  fs.writeFileSync(filePath, basicDSL);
  
  console.log(`Created basic Structurizr workspace at ${filePath}`);
}

/**
 * Generate a Mermaid diagram for visualization
 */
function generateMermaidDiagram(model: ArchitectureModel): void {
  let mermaidCode = 'graph TD\n';
  
  // Add containers as subgraphs
  for (const container of model.containers) {
    mermaidCode += `  subgraph ${container.name}\n`;
    
    // Add nodes for components in this container
    for (const component of model.components.filter(c => c.container === container.name)) {
      const id = component.name.replace(/[^a-zA-Z0-9]/g, '_');
      const style = component.isTechnicalDebt ? 'fill:#ff9800,color:white' : (component.isLegacy ? 'fill:#f44336,color:white' : '');
      
      mermaidCode += `    ${id}["${component.name} (${component.type})"]${style ? ':::' + (component.isTechnicalDebt ? 'technicalDebt' : 'legacy') : ''}\n`;
    }
    
    mermaidCode += `  end\n\n`;
  }
  
  // Add relationships
  for (const rel of model.relationships) {
    const sourceId = rel.source.replace(/[^a-zA-Z0-9]/g, '_');
    const targetId = rel.target.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Only add the relationship if both components exist in the model
    if (model.components.some(c => c.name === rel.source) && model.components.some(c => c.name === rel.target)) {
      mermaidCode += `  ${sourceId} --> ${targetId}\n`;
    }
  }
  
  // Add container relationships
  mermaidCode += `\n  %% Container relationships\n`;
  mermaidCode += `  WebApplication --> Database\n`;
  mermaidCode += `  WebApplication --> AuthenticationService\n`;
  mermaidCode += `  WebApplication --> PaymentService\n`;
  mermaidCode += `  WebApplication --> BookingSystem\n`;
  
  // Add class definitions
  mermaidCode += '  classDef technicalDebt fill:#ff9800,color:white;\n';
  mermaidCode += '  classDef legacy fill:#f44336,color:white;\n';
  
  // Save Mermaid diagram with timestamp
  const outputDir = './docs/architecture/extraction';
  
  // Use centralized function to save with timestamp
  const mermaidPath = saveWithTimestamp(
    outputDir, 
    'architecture-diagram.mmd', 
    mermaidCode
  );
  
  console.log(`Mermaid diagram saved to ${mermaidPath}`);
}

/**
 * Generate a separate visualization for technical debt and legacy components
 */
function generateTechnicalDebtVisualization(model: ArchitectureModel): void {
  const technicalDebtComponents = model.components.filter(c => c.isTechnicalDebt || c.isLegacy);
  
  // Skip if no technical debt or legacy components found
  if (technicalDebtComponents.length === 0) {
    console.log('No technical debt or legacy components found');
    return;
  }
  
  // Use the unified technical debt Mermaid generator from architecture-utils
  const mermaidCode = generateTechnicalDebtMermaid(model.components);
  
  // Add title
  const fullMermaidCode = `%% Technical Debt and Legacy Components\n${mermaidCode}`;
  
  // Save Mermaid diagram with timestamp
  const outputDir = './docs/architecture/extraction';
  
  // Use centralized function to save with timestamp
  const mermaidPath = saveWithTimestamp(
    outputDir, 
    'technical-debt-diagram.mmd', 
    fullMermaidCode
  );
  
  // Generate and save report using the unified report generator
  const report = generateTechnicalDebtReport(model.components);
  
  // Use centralized function to save with timestamp
  const reportPath = saveWithTimestamp(
    outputDir, 
    'technical-debt-report.md', 
    report
  );
  
  console.log(`Technical debt visualization saved to ${mermaidPath}`);
  console.log(`Technical debt report saved to ${reportPath}`);
}

// Run the extraction
extractArchitecture().catch(error => {
  console.error('Error during architecture extraction:', error);
  process.exit(1);
});