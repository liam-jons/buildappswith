/**
 * Potentially Unused Features Analyzer for Buildappswith
 * Version: 1.0.125
 * 
 * This script analyzes the architecture extraction results to identify components
 * that may be unused or contribute to unnecessary architectural complexity.
 * It builds on the existing architecture extraction tools to provide actionable insights
 * for code cleanup and architectural simplification.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile } from 'ts-morph';
import { ComponentTypes, getTimestamp, saveWithTimestamp } from './architecture-utils';

interface Component {
  name: string;
  type: string;
  path: string;
  dependencies?: string[];
  isLegacy?: boolean;
  isTechnicalDebt?: boolean;
  container?: string;
  usageScore?: number;
  complexityScore?: number;
  incomingReferences?: number;
  outgoingReferences?: number;
  isUnused?: boolean;
  unusedReason?: string;
  lastModified?: string;
}

interface Container {
  name: string;
  description: string;
  technology: string;
  componentCount?: number;
  complexity?: number;
  couplingScore?: number;
}

interface Architecture {
  components: Component[];
  relationships: {
    source: string;
    target: string;
    description: string;
  }[];
  containers: Container[];
}

interface ArchitecturalComplexity {
  overallComplexity: number;
  containerComplexity: Record<string, number>;
  mostComplexComponents: Component[];
  unusedComponents: Component[];
  cyclicDependencies: {
    components: string[];
    paths: string[];
  }[];
  patternInconsistencies: {
    pattern: string;
    inconsistentComponents: Component[];
    recommendedPattern: string;
  }[];
}

/**
 * Main function to analyze potentially unused features and architectural complexity
 */
async function analyzeUnusedFeatures() {
  console.log('Analyzing potentially unused features and architectural complexity...');
  
  const extractionDir = './docs/architecture/extraction';
  const reportOutputDir = './docs/architecture/analysis';
  
  // Ensure output directory exists
  if (!fs.existsSync(reportOutputDir)) {
    fs.mkdirSync(reportOutputDir, { recursive: true });
  }
  
  // Load extracted architecture model
  const architecture = loadArchitectureModel(path.join(extractionDir, 'extracted-model.json'));
  
  if (!architecture) {
    console.error('Failed to load architecture model. Run extraction first.');
    process.exit(1);
  }
  
  // Create a new TS project for import analysis
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });
  
  // Analyze potentially unused components
  console.log('Analyzing component usage...');
  const enhancedArchitecture = enhanceWithUsageAnalysis(architecture, project);
  
  // Analyze architectural complexity
  console.log('Analyzing architectural complexity...');
  const complexityAnalysis = analyzeArchitecturalComplexity(enhancedArchitecture);
  
  // Generate reports
  const unusedComponentsReport = generateUnusedComponentsReport(enhancedArchitecture);
  const complexityReport = generateComplexityReport(enhancedArchitecture, complexityAnalysis);
  
  // Save analysis results
  console.log('Saving analysis results...');
  saveAnalysisResults(
    enhancedArchitecture, 
    complexityAnalysis, 
    unusedComponentsReport, 
    complexityReport, 
    reportOutputDir
  );
  
  console.log('Analysis complete. Reports available in ' + reportOutputDir);
}

/**
 * Load architecture model from file
 */
function loadArchitectureModel(filePath: string): Architecture | null {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    return null;
  } catch (error) {
    console.error(`Error loading architecture model from ${filePath}:`, error);
    return null;
  }
}

/**
 * Enhance architecture model with usage analysis
 */
function enhanceWithUsageAnalysis(architecture: Architecture, project: Project): Architecture {
  // Deep clone to avoid modifying the original
  const enhancedArchitecture: Architecture = JSON.parse(JSON.stringify(architecture));
  
  // Build a map of file paths to components for faster lookup
  const pathToComponentMap = new Map<string, Component>();
  enhancedArchitecture.components.forEach(component => {
    pathToComponentMap.set(component.path, component);
  });
  
  // Count incoming references for each component
  // Initialize reference counts to 0
  enhancedArchitecture.components.forEach(component => {
    component.incomingReferences = 0;
    component.outgoingReferences = component.dependencies?.length || 0;
  });
  
  // Count incoming references based on relationships
  enhancedArchitecture.relationships.forEach(relationship => {
    const targetComponent = enhancedArchitecture.components.find(c => c.name === relationship.target);
    if (targetComponent) {
      targetComponent.incomingReferences = (targetComponent.incomingReferences || 0) + 1;
    }
  });
  
  // Analyze import statements in source files
  console.log('Analyzing import statements in source files...');
  project.addSourceFilesAtPaths([
    './app/**/*.ts',
    './app/**/*.tsx',
    './components/**/*.ts',
    './components/**/*.tsx',
    './lib/**/*.ts',
    './lib/**/*.tsx',
  ]);
  
  // Skip test files
  const sourceFiles = project.getSourceFiles().filter(file => {
    const filePath = file.getFilePath();
    return !filePath.includes('__tests__') && 
           !filePath.includes('.test.') && 
           !filePath.includes('.spec.');
  });
  
  // Process import statements
  sourceFiles.forEach(sourceFile => {
    const imports = sourceFile.getImportDeclarations();
    imports.forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      // Look for direct imports of components
      enhancedArchitecture.components.forEach(component => {
        const componentName = component.name;
        const componentDir = path.dirname(component.path);
        const componentShortPath = componentName === 'index' 
          ? componentDir
          : path.join(componentDir, componentName);
        
        if (moduleSpecifier === componentName || 
            moduleSpecifier.endsWith(`/${componentName}`) || 
            moduleSpecifier === `./${componentName}` ||
            moduleSpecifier === componentShortPath ||
            moduleSpecifier.endsWith(componentShortPath)) {
          
          component.incomingReferences = (component.incomingReferences || 0) + 1;
        }
      });
    });
  });
  
  // Calculate usage score based on incoming references
  enhancedArchitecture.components.forEach(component => {
    // Score from 0-10 based on incoming references
    // 0 = no references, 10 = lots of references (10+)
    component.usageScore = Math.min(10, component.incomingReferences || 0);
    
    // Determine if component is potentially unused
    component.isUnused = component.usageScore === 0 && 
                         !component.path.includes('/pages/') && 
                         !component.path.includes('/app/') &&
                         !component.path.includes('middleware') &&
                         !component.path.includes('schema.prisma') &&
                         !component.type.includes('API Endpoint');
    
    // Provide reason if component might be unused
    if (component.isUnused) {
      component.unusedReason = 'No incoming references found';
    }
    
    // For page components and API routes, check if they have routes to them
    if (component.type === ComponentTypes.PAGE || component.type === ComponentTypes.API_ROUTE) {
      const routeComponents = enhancedArchitecture.components.filter(c => 
        c.path.includes('/navigation/') || 
        c.path.includes('/site-header') || 
        c.path.includes('/layout')
      );
      
      let foundRoute = false;
      const componentNameNormalized = component.name.toLowerCase();
      
      // Read file content to check for route references
      routeComponents.forEach(routeComponent => {
        try {
          const content = fs.readFileSync(routeComponent.path, 'utf-8');
          
          // Check for various route patterns
          if (content.includes(`href="/${componentNameNormalized}"`) || 
              content.includes(`href='/${componentNameNormalized}'`) || 
              content.includes(`href={\`/${componentNameNormalized}\`}`) || 
              content.includes(`href={\`/${componentNameNormalized}/`) || 
              content.includes(`href="/app/${componentNameNormalized}"`) || 
              content.includes(`href='/app/${componentNameNormalized}'`)) {
            foundRoute = true;
          }
        } catch (err) {
          // Ignore file reading errors
        }
      });
      
      if (!foundRoute && component.incomingReferences === 0) {
        component.isUnused = true;
        component.unusedReason = 'Page/route with no navigation links to it';
      }
    }
    
    // Add file last modified date
    try {
      const stats = fs.statSync(component.path);
      component.lastModified = stats.mtime.toISOString().split('T')[0];
    } catch (err) {
      // If we can't get the file stats, ignore
    }
  });
  
  // Calculate complexity score for each component
  enhancedArchitecture.components.forEach(component => {
    // Base complexity score on:
    // 1. Number of outgoing dependencies (0-5)
    // 2. File size (0-3)
    // 3. Component type complexity (0-2)
    
    let sizeScore = 0;
    try {
      const content = fs.readFileSync(component.path, 'utf-8');
      const lineCount = content.split('\n').length;
      // 0-100 lines = 0, 100-300 = 1, 300-500 = 2, 500+ = 3
      sizeScore = Math.min(3, Math.floor(lineCount / 100));
    } catch (err) {
      // If we can't read the file, assume minimal complexity
    }
    
    // Component type complexity
    let typeComplexity = 0;
    if (component.type === ComponentTypes.CONTEXT || 
        component.type === ComponentTypes.SERVICE ||
        component.type === ComponentTypes.MIDDLEWARE) {
      typeComplexity = 2;
    } else if (component.type === ComponentTypes.UI_COMPONENT ||
               component.type === ComponentTypes.AUTHENTICATION) {
      typeComplexity = 1;
    }
    
    // Calculate final complexity score
    component.complexityScore = Math.min(10, 
      (component.outgoingReferences || 0) * 0.5 + // Dependencies weight
      sizeScore * 1.0 +                          // Size weight
      typeComplexity * 1.0                       // Type weight
    );
  });
  
  // Update container stats
  enhancedArchitecture.containers.forEach(container => {
    const containerComponents = enhancedArchitecture.components.filter(
      c => c.container === container.name
    );
    
    container.componentCount = containerComponents.length;
    
    // Container complexity is average of component complexities
    const totalComplexity = containerComponents.reduce(
      (sum, component) => sum + (component.complexityScore || 0), 
      0
    );
    
    container.complexity = containerComponents.length > 0 
      ? totalComplexity / containerComponents.length 
      : 0;
    
    // Calculate container coupling score - how much it depends on other containers
    const externalRelationships = enhancedArchitecture.relationships.filter(rel => {
      const sourceComponent = enhancedArchitecture.components.find(c => c.name === rel.source);
      const targetComponent = enhancedArchitecture.components.find(c => c.name === rel.target);
      
      return sourceComponent && 
             targetComponent && 
             sourceComponent.container === container.name && 
             targetComponent.container !== container.name;
    });
    
    container.couplingScore = externalRelationships.length / Math.max(1, containerComponents.length);
  });
  
  return enhancedArchitecture;
}

/**
 * Analyze architectural complexity
 */
function analyzeArchitecturalComplexity(architecture: Architecture): ArchitecturalComplexity {
  const result: ArchitecturalComplexity = {
    overallComplexity: 0,
    containerComplexity: {},
    mostComplexComponents: [],
    unusedComponents: [],
    cyclicDependencies: [],
    patternInconsistencies: [],
  };
  
  // Calculate overall complexity score
  const totalComplexity = architecture.components.reduce(
    (sum, component) => sum + (component.complexityScore || 0),
    0
  );
  
  result.overallComplexity = totalComplexity / architecture.components.length;
  
  // Container complexity
  architecture.containers.forEach(container => {
    result.containerComplexity[container.name] = container.complexity || 0;
  });
  
  // Find most complex components
  result.mostComplexComponents = [...architecture.components]
    .filter(c => (c.complexityScore || 0) > 7)
    .sort((a, b) => (b.complexityScore || 0) - (a.complexityScore || 0))
    .slice(0, 10);
  
  // Find unused components
  result.unusedComponents = architecture.components
    .filter(c => c.isUnused)
    .sort((a, b) => (b.complexityScore || 0) - (a.complexityScore || 0));
  
  // Detect cyclic dependencies
  result.cyclicDependencies = detectCyclicDependencies(architecture);
  
  // Detect pattern inconsistencies
  result.patternInconsistencies = detectPatternInconsistencies(architecture);
  
  return result;
}

/**
 * Detect cyclic dependencies in the architecture
 */
function detectCyclicDependencies(architecture: Architecture): {components: string[], paths: string[]}[] {
  const cycles: {components: string[], paths: string[]}[] = [];
  
  // Build a dependency graph
  const graph: Record<string, string[]> = {};
  
  architecture.components.forEach(component => {
    graph[component.name] = [];
  });
  
  architecture.relationships.forEach(rel => {
    if (graph[rel.source]) {
      graph[rel.source].push(rel.target);
    }
  });
  
  // Helper function to detect cycles using DFS
  function findCycles(node: string, visited: Set<string>, path: string[], pathNodes: string[]) {
    if (path.indexOf(node) !== -1) {
      // We found a cycle
      const cycleStart = path.indexOf(node);
      const cyclePath = path.slice(cycleStart);
      const cycleNodes = pathNodes.slice(cycleStart);
      cycleNodes.push(node); // Add the current node to complete the cycle
      
      cycles.push({
        components: cycleNodes,
        paths: cyclePath
      });
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visited.add(node);
    path.push(node);
    pathNodes.push(node);
    
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      findCycles(neighbor, visited, [...path], [...pathNodes]);
    }
  }
  
  // Start DFS from each node
  for (const component of architecture.components) {
    findCycles(component.name, new Set<string>(), [], []);
  }
  
  // Remove duplicates
  const uniqueCycles: {components: string[], paths: string[]}[] = [];
  const cycleSets = new Set<string>();
  
  cycles.forEach(cycle => {
    const key = cycle.components.sort().join(',');
    if (!cycleSets.has(key)) {
      cycleSets.add(key);
      uniqueCycles.push(cycle);
    }
  });
  
  return uniqueCycles;
}

/**
 * Detect pattern inconsistencies in the architecture
 */
function detectPatternInconsistencies(architecture: Architecture): {
  pattern: string,
  inconsistentComponents: Component[],
  recommendedPattern: string
}[] {
  const inconsistencies: {
    pattern: string,
    inconsistentComponents: Component[],
    recommendedPattern: string
  }[] = [];
  
  // Check UI component naming consistency
  const uiComponents = architecture.components.filter(c => c.type === ComponentTypes.UI_COMPONENT);
  const kebabCaseComponents = uiComponents.filter(c => c.name.includes('-'));
  const camelCaseComponents = uiComponents.filter(c => !c.name.includes('-') && /[a-z][A-Z]/.test(c.name));
  
  if (kebabCaseComponents.length > 0 && camelCaseComponents.length > 0) {
    // We have inconsistent naming
    const recommended = kebabCaseComponents.length > camelCaseComponents.length 
      ? 'kebab-case' 
      : 'camelCase';
    
    const inconsistentComponents = recommended === 'kebab-case' 
      ? camelCaseComponents 
      : kebabCaseComponents;
    
    inconsistencies.push({
      pattern: 'Component Naming',
      inconsistentComponents,
      recommendedPattern: `Use ${recommended} consistently for component naming`
    });
  }
  
  // Check folder structure consistency for similar components
  const folderStructureMap = new Map<string, string[]>();
  
  architecture.components.forEach(component => {
    const type = component.type;
    const folder = path.dirname(component.path);
    
    if (!folderStructureMap.has(type)) {
      folderStructureMap.set(type, []);
    }
    
    folderStructureMap.get(type)?.push(folder);
  });
  
  // Find types with inconsistent folder structures
  folderStructureMap.forEach((folders, type) => {
    // Count frequency of each folder pattern
    const folderCounts = new Map<string, number>();
    folders.forEach(folder => {
      folderCounts.set(folder, (folderCounts.get(folder) || 0) + 1);
    });
    
    // If we have multiple patterns, find the most common one
    if (folderCounts.size > 1) {
      let mostCommonFolder = '';
      let maxCount = 0;
      
      folderCounts.forEach((count, folder) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonFolder = folder;
        }
      });
      
      // Find components not following the most common pattern
      const inconsistentComponents = architecture.components.filter(component => {
        return component.type === type && 
               path.dirname(component.path) !== mostCommonFolder;
      });
      
      if (inconsistentComponents.length > 0) {
        inconsistencies.push({
          pattern: `${type} Folder Structure`,
          inconsistentComponents,
          recommendedPattern: `Use consistent folder structure: ${mostCommonFolder}`
        });
      }
    }
  });
  
  // Check for API route implementation consistency
  const apiRoutes = architecture.components.filter(c => 
    c.type === ComponentTypes.API_ROUTE || 
    c.path.includes('/api/')
  );
  
  // Check handler function style
  const exportDefaultHandlers = [];
  const namedExportHandlers = [];
  
  for (const route of apiRoutes) {
    try {
      const content = fs.readFileSync(route.path, 'utf-8');
      
      if (content.includes('export default') || content.includes('export default function')) {
        exportDefaultHandlers.push(route);
      } else if (content.includes('export async function') || 
                 content.includes('export function') ||
                 content.match(/export const \w+ =/)) {
        namedExportHandlers.push(route);
      }
    } catch (err) {
      // Skip if we can't read the file
    }
  }
  
  if (exportDefaultHandlers.length > 0 && namedExportHandlers.length > 0) {
    const recommended = exportDefaultHandlers.length > namedExportHandlers.length
      ? 'export default'
      : 'named exports';
    
    const inconsistentComponents = recommended === 'export default'
      ? namedExportHandlers
      : exportDefaultHandlers;
    
    inconsistencies.push({
      pattern: 'API Route Export Style',
      inconsistentComponents,
      recommendedPattern: `Use ${recommended} consistently for API routes`
    });
  }
  
  return inconsistencies;
}

/**
 * Generate report for potentially unused components
 */
function generateUnusedComponentsReport(architecture: Architecture): string {
  let report = '# Potentially Unused Components Report\n\n';
  
  // Add current date
  const currentDate = new Date().toISOString().split('T')[0];
  report += `*Generated on: ${currentDate}*\n\n`;
  
  // Add overall statistics
  const unusedComponents = architecture.components.filter(c => c.isUnused);
  
  report += '## Overview\n\n';
  report += `Total Components: **${architecture.components.length}**\n`;
  report += `Potentially Unused Components: **${unusedComponents.length}** (${Math.round(unusedComponents.length / architecture.components.length * 100)}% of total)\n\n`;
  
  // Group by container
  report += '## Unused Components by Container\n\n';
  
  for (const container of architecture.containers) {
    const containerUnusedComponents = unusedComponents.filter(c => c.container === container.name);
    
    if (containerUnusedComponents.length === 0) {
      continue;
    }
    
    report += `### ${container.name}\n\n`;
    report += `Unused Component Count: **${containerUnusedComponents.length}** of ${container.componentCount} total (${Math.round(containerUnusedComponents.length / (container.componentCount || 1) * 100)}%)\n\n`;
    
    report += '| Component | Type | Path | Last Modified | Reason |\n';
    report += '|-----------|------|------|--------------|--------|\n';
    
    for (const component of containerUnusedComponents) {
      report += `| ${component.name} | ${component.type} | ${component.path} | ${component.lastModified || 'Unknown'} | ${component.unusedReason || 'No incoming references'} |\n`;
    }
    
    report += '\n';
  }
  
  // AI Timeline specific analysis
  report += '## AI Timeline Feature Analysis\n\n';
  
  const timelineComponents = architecture.components.filter(c => 
    c.path.includes('/timeline/') || 
    c.path.includes('ai-timeline') ||
    c.name.includes('timeline') ||
    c.name.includes('Timeline')
  );
  
  if (timelineComponents.length > 0) {
    report += `The AI Timeline feature includes **${timelineComponents.length}** components:\n\n`;
    
    report += '| Component | Type | Path | Usage Score | Complexity | Unused |\n';
    report += '|-----------|------|------|-------------|------------|--------|\n';
    
    for (const component of timelineComponents) {
      report += `| ${component.name} | ${component.type} | ${component.path} | ${component.usageScore || 0}/10 | ${component.complexityScore?.toFixed(1) || 0}/10 | ${component.isUnused ? '✓' : ''} |\n`;
    }
    
    // Calculate total lines of code for timeline feature
    let totalLines = 0;
    for (const component of timelineComponents) {
      try {
        const content = fs.readFileSync(component.path, 'utf-8');
        totalLines += content.split('\n').length;
      } catch (err) {
        // Skip if we can't read the file
      }
    }
    
    report += `\nTotal lines of code: ~${totalLines}\n\n`;
    
    // Add recommendation
    const unusedTimelineComponents = timelineComponents.filter(c => c.isUnused);
    
    if (unusedTimelineComponents.length > 0) {
      const unusedPercentage = Math.round(unusedTimelineComponents.length / timelineComponents.length * 100);
      
      report += `### Timeline Feature Recommendation\n\n`;
      report += `${unusedPercentage}% of AI Timeline components appear to be unused. `;
      
      if (unusedPercentage > 50) {
        report += `This feature may be a good candidate for removal or significant refactoring. Consider removing the feature entirely or replacing it with a simplified implementation.\n\n`;
      } else {
        report += `Consider refactoring the feature to remove unused components and reduce complexity.\n\n`;
      }
      
      report += `If the feature is to be removed, ensure proper cleanup of:\n`;
      report += `- Related database models (${timelineComponents.filter(c => c.type === 'Data Model').length} components)\n`;
      report += `- UI components (${timelineComponents.filter(c => c.type === 'UI Component').length} components)\n`;
      report += `- API routes (${timelineComponents.filter(c => c.type === 'API Endpoint').length} components)\n`;
      report += `- Navigation links to timeline pages\n`;
      report += `- Mock data or utilities (${timelineComponents.filter(c => c.type === 'Utility').length} components)\n\n`;
    }
  } else {
    report += 'No components related to the AI Timeline feature were found.\n\n';
  }
  
  // Add cleanup strategy section
  report += '## Recommended Cleanup Strategy\n\n';
  report += '1. **Verify Usage**: Manually verify that identified components are truly unused\n';
  report += '2. **Prioritize Removal**: Start with components that have:\n';
  report += '   - High complexity scores (reducing technical debt)\n';
  report += '   - Isolated components with low coupling\n';
  report += '   - Older "last modified" dates\n';
  report += '3. **Bundle Removals**: Group related components to remove together\n';
  report += '4. **Update Tests**: Ensure test coverage is maintained\n';
  report += '5. **Documentation**: Update architecture documentation after cleanup\n\n';
  
  return report;
}

/**
 * Generate architectural complexity report
 */
function generateComplexityReport(
  architecture: Architecture, 
  complexityAnalysis: ArchitecturalComplexity
): string {
  let report = '# Architectural Complexity Analysis\n\n';
  
  // Add current date
  const currentDate = new Date().toISOString().split('T')[0];
  report += `*Generated on: ${currentDate}*\n\n`;
  
  // Add overall complexity
  report += '## Overall Complexity\n\n';
  report += `System Complexity Score: **${complexityAnalysis.overallComplexity.toFixed(2)}/10**\n\n`;
  
  // Add container complexity
  report += '## Container Complexity\n\n';
  report += '| Container | Component Count | Complexity Score | Coupling Score |\n';
  report += '|-----------|-----------------|------------------|----------------|\n';
  
  for (const container of architecture.containers) {
    report += `| ${container.name} | ${container.componentCount || 0} | ${(container.complexity || 0).toFixed(2)}/10 | ${(container.couplingScore || 0).toFixed(2)} |\n`;
  }
  
  report += '\n';
  
  // Add most complex components
  report += '## Most Complex Components\n\n';
  
  if (complexityAnalysis.mostComplexComponents.length > 0) {
    report += '| Component | Type | Container | Complexity | Dependencies | Incoming References |\n';
    report += '|-----------|------|-----------|------------|--------------|--------------------|\n';
    
    for (const component of complexityAnalysis.mostComplexComponents) {
      report += `| ${component.name} | ${component.type} | ${component.container} | ${component.complexityScore?.toFixed(2) || 0}/10 | ${component.outgoingReferences || 0} | ${component.incomingReferences || 0} |\n`;
    }
    
    report += '\n';
  } else {
    report += 'No highly complex components found.\n\n';
  }
  
  // Add cyclic dependencies
  report += '## Cyclic Dependencies\n\n';
  
  if (complexityAnalysis.cyclicDependencies.length > 0) {
    report += `Detected **${complexityAnalysis.cyclicDependencies.length}** dependency cycles in the codebase.\n\n`;
    
    complexityAnalysis.cyclicDependencies.forEach((cycle, index) => {
      report += `### Cycle ${index + 1}\n\n`;
      report += `Components: ${cycle.components.join(' → ')} → ${cycle.components[0]}\n\n`;
      
      // Get paths for components in the cycle
      const componentPaths = cycle.components.map(componentName => {
        const component = architecture.components.find(c => c.name === componentName);
        return component ? component.path : 'Unknown';
      });
      
      report += '| Component | Path |\n';
      report += '|-----------|------|\n';
      
      cycle.components.forEach((component, i) => {
        report += `| ${component} | ${componentPaths[i] || 'Unknown'} |\n`;
      });
      
      report += '\n';
    });
  } else {
    report += 'No cyclic dependencies detected.\n\n';
  }
  
  // Add pattern inconsistencies
  report += '## Pattern Inconsistencies\n\n';
  
  if (complexityAnalysis.patternInconsistencies.length > 0) {
    report += `Detected **${complexityAnalysis.patternInconsistencies.length}** pattern inconsistencies in the codebase.\n\n`;
    
    complexityAnalysis.patternInconsistencies.forEach((inconsistency, index) => {
      report += `### ${inconsistency.pattern}\n\n`;
      report += `**Recommended Pattern**: ${inconsistency.recommendedPattern}\n\n`;
      report += `Affected components (${inconsistency.inconsistentComponents.length}):\n\n`;
      
      report += '| Component | Type | Path |\n';
      report += '|-----------|------|------|\n';
      
      inconsistency.inconsistentComponents.forEach(component => {
        report += `| ${component.name} | ${component.type} | ${component.path} |\n`;
      });
      
      report += '\n';
    });
  } else {
    report += 'No pattern inconsistencies detected.\n\n';
  }
  
  // Add simplification recommendations
  report += '## Architecture Simplification Recommendations\n\n';
  
  // Container coupling recommendations
  const highCouplingContainers = architecture.containers
    .filter(c => (c.couplingScore || 0) > 0.3)
    .sort((a, b) => (b.couplingScore || 0) - (a.couplingScore || 0));
  
  if (highCouplingContainers.length > 0) {
    report += '### High Coupling Containers\n\n';
    report += 'The following containers have high external coupling and may benefit from refactoring:\n\n';
    
    for (const container of highCouplingContainers) {
      report += `- **${container.name}** (Coupling: ${(container.couplingScore || 0).toFixed(2)}): Consider strengthening container boundaries and reducing dependencies on other containers\n`;
    }
    
    report += '\n';
  }
  
  // Component cohesion recommendations
  const lowCohesionComponents = architecture.components
    .filter(c => 
      (c.outgoingReferences || 0) > 5 && 
      (c.complexityScore || 0) > 6 && 
      (c.incomingReferences || 0) > 3
    )
    .sort((a, b) => (b.complexityScore || 0) - (a.complexityScore || 0))
    .slice(0, 5);
  
  if (lowCohesionComponents.length > 0) {
    report += '### Components with Potential Responsibility Issues\n\n';
    report += 'The following components have high complexity, many dependencies, and are used by many other components. They may benefit from being split into smaller, more focused components:\n\n';
    
    for (const component of lowCohesionComponents) {
      report += `- **${component.name}** (${component.type}): High complexity (${component.complexityScore?.toFixed(2) || 0}/10) with ${component.outgoingReferences || 0} dependencies and used by ${component.incomingReferences || 0} components\n`;
    }
    
    report += '\n';
  }
  
  return report;
}

/**
 * Save analysis results to disk
 */
function saveAnalysisResults(
  enhancedArchitecture: Architecture,
  complexityAnalysis: ArchitecturalComplexity,
  unusedComponentsReport: string,
  complexityReport: string,
  outputDir: string
): void {
  // Save enhanced architecture model
  fs.writeFileSync(
    path.join(outputDir, 'enhanced-architecture.json'),
    JSON.stringify(enhancedArchitecture, null, 2)
  );
  
  // Save complexity analysis
  fs.writeFileSync(
    path.join(outputDir, 'complexity-analysis.json'),
    JSON.stringify(complexityAnalysis, null, 2)
  );
  
  // Save unused components report
  saveWithTimestamp(
    outputDir,
    'unused-components-report.md',
    unusedComponentsReport
  );
  
  // Save complexity report
  saveWithTimestamp(
    outputDir,
    'architectural-complexity-report.md',
    complexityReport
  );
  
  // Generate Mermaid diagram for unused components
  generateUnusedComponentsMermaid(
    enhancedArchitecture,
    path.join(outputDir, 'unused-components-diagram.mmd')
  );
  
  // Generate HTML versions for better readability
  generateHtmlReport(
    unusedComponentsReport,
    path.join(outputDir, 'unused-components-report.html')
  );
  
  generateHtmlReport(
    complexityReport,
    path.join(outputDir, 'architectural-complexity-report.html')
  );
}

/**
 * Generate Mermaid diagram for unused components
 */
function generateUnusedComponentsMermaid(architecture: Architecture, outputPath: string): void {
  const unusedComponents = architecture.components.filter(c => c.isUnused);
  
  let mermaidCode = 'graph TD\n';
  
  // Add subgraphs for containers
  for (const container of architecture.containers) {
    const containerUnusedComponents = unusedComponents.filter(c => c.container === container.name);
    
    if (containerUnusedComponents.length === 0) {
      continue;
    }
    
    mermaidCode += `    subgraph ${container.name}\n`;
    
    for (const component of containerUnusedComponents) {
      const id = component.name.replace(/[^a-zA-Z0-9]/g, '_');
      const label = `${component.name} (${component.type})`;
      
      mermaidCode += `        ${id}["${label}"]:::unused\n`;
    }
    
    mermaidCode += '    end\n\n';
  }
  
  // Add AI Timeline subgraph
  const timelineComponents = architecture.components.filter(c => 
    c.path.includes('/timeline/') || 
    c.path.includes('ai-timeline') ||
    c.name.includes('timeline') ||
    c.name.includes('Timeline')
  );
  
  if (timelineComponents.length > 0) {
    mermaidCode += '    subgraph AITimeline[AI Timeline Feature]\n';
    
    for (const component of timelineComponents) {
      const id = component.name.replace(/[^a-zA-Z0-9]/g, '_');
      const label = `${component.name} (${component.type})`;
      
      if (component.isUnused) {
        mermaidCode += `        ${id}["${label}"]:::unused\n`;
      } else {
        mermaidCode += `        ${id}["${label}"]:::timeline\n`;
      }
    }
    
    mermaidCode += '    end\n\n';
  }
  
  // Add style definitions
  mermaidCode += '    classDef unused fill:#FF0000,color:white;\n';
  mermaidCode += '    classDef timeline fill:#0000FF,color:white;\n';
  
  fs.writeFileSync(outputPath, mermaidCode);
}

/**
 * Generate HTML report for better readability
 */
function generateHtmlReport(markdownContent: string, outputPath: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buildappswith Architecture Analysis</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 {
      color: #0066cc;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 4px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #222;
        color: #eee;
      }
      h1, h2, h3, h4 {
        color: #66b3ff;
      }
      table {
        border-color: #444;
      }
      th {
        background-color: #333;
      }
      td {
        border-color: #444;
      }
      tr:nth-child(even) {
        background-color: #2a2a2a;
      }
      code {
        background-color: #333;
      }
      a {
        color: #66b3ff;
      }
    }
  </style>
</head>
<body>
  ${convertMarkdownToHtml(markdownContent)}
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
}

/**
 * Simple function to convert basic Markdown to HTML
 */
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lists
  html = html.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // Tables
  let inTable = false;
  const lines = html.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('|') && line.endsWith('|')) {
      // Table row
      if (!inTable) {
        processedLines.push('<table>');
        inTable = true;
      }
      
      const cells = line.split('|').filter(cell => cell.trim() !== '');
      const isHeader = i > 0 && lines[i-1].startsWith('|') && lines[i-1].includes('---');
      
      let rowHtml = '<tr>';
      cells.forEach(cell => {
        rowHtml += isHeader ? `<th>${cell.trim()}</th>` : `<td>${cell.trim()}</td>`;
      });
      rowHtml += '</tr>';
      
      processedLines.push(rowHtml);
      
      // Skip separator row
      if (line.includes('---')) {
        continue;
      }
    } else if (inTable) {
      processedLines.push('</table>');
      inTable = false;
      processedLines.push(line);
    } else {
      processedLines.push(line);
    }
  }
  
  if (inTable) {
    processedLines.push('</table>');
  }
  
  html = processedLines.join('\n');
  
  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><h([1-6])>/g, '<h$1>');
  html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  html = html.replace(/<p><ul>/g, '<ul>');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');
  html = html.replace(/<p><table>/g, '<table>');
  html = html.replace(/<\/table><\/p>/g, '</table>');
  
  return html;
}

// Run the analysis
analyzeUnusedFeatures().catch(error => {
  console.error('Error during unused features analysis:', error);
  process.exit(1);
});
