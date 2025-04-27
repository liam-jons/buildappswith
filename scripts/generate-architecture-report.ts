/**
 * Architecture Report Generator for Buildappswith
 * Version: 1.0.3
 * 
 * This script generates a comprehensive report of the architecture extraction results.
 * Updated to work with the container-based architecture model.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Component {
  name: string;
  type: string;
  path: string;
  dependencies?: string[];
  isLegacy?: boolean;
  isTechnicalDebt?: boolean;
  container?: string; // Added container field
}

interface Architecture {
  components: Component[];
  relationships: {
    source: string;
    target: string;
    description: string;
  }[];
  // Added containers field
  containers: {
    name: string;
    description: string;
    technology: string;
  }[];
}

interface AuthComponent {
  name: string;
  path: string;
  type: string;
  description?: string;
  usedBy?: string[];
  dependencies?: string[];
  container?: string; // Added container field
}

interface AuthArchitecture {
  components: AuthComponent[];
  flows: {
    name: string;
    description: string;
    steps: string[];
  }[];
  // Added containers field
  containers: {
    name: string;
    description: string;
    technology: string;
  }[];
}

/**
 * Main function to generate architecture report
 */
async function generateArchitectureReport() {
  console.log('Generating architecture report...');
  
  const extractionDir = './docs/architecture/extraction';
  const reportOutputPath = path.join(extractionDir, 'architecture-report.md');
  
  // Ensure extraction directory exists
  if (!fs.existsSync(extractionDir)) {
    fs.mkdirSync(extractionDir, { recursive: true });
  }
  
  // Load extracted architecture models
  const generalArchitecture = loadArchitectureModel(path.join(extractionDir, 'extracted-model.json'));
  const authArchitecture = loadAuthArchitectureModel(path.join(extractionDir, 'auth-architecture.json'));
  
  // Generate the comprehensive report
  const report = generateReport(generalArchitecture, authArchitecture);
  
  // Write the report to file
  fs.writeFileSync(reportOutputPath, report);
  
  // Generate HTML report for easier viewing
  generateHtmlReport(report, path.join(extractionDir, 'architecture-report.html'));
  
  console.log(`Architecture report generated at ${reportOutputPath}`);
}

/**
 * Load general architecture model from file
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
 * Load authentication architecture model from file
 */
function loadAuthArchitectureModel(filePath: string): AuthArchitecture | null {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    return null;
  } catch (error) {
    console.error(`Error loading auth architecture model from ${filePath}:`, error);
    return null;
  }
}

/**
 * Generate comprehensive architecture report
 */
function generateReport(
  generalArchitecture: Architecture | null,
  authArchitecture: AuthArchitecture | null
): string {
  let report = '# Buildappswith Architecture Report\n\n';
  
  // Add current date
  const currentDate = new Date().toISOString().split('T')[0];
  report += `*Generated on: ${currentDate}*\n\n`;
  
  // Add overall statistics
  report += '## Architecture Overview\n\n';
  
  if (generalArchitecture) {
    // Container overview
    report += '### System Containers\n\n';
    report += 'The architecture is divided into the following containers based on PRD 2.1:\n\n';
    report += '| Container | Description | Technology |\n';
    report += '|-----------|-------------|------------|\n';
    
    for (const container of generalArchitecture.containers) {
      report += `| ${container.name} | ${container.description} | ${container.technology} |\n`;
    }
    
    report += '\n';
    
    // Component statistics
    const componentTypes = new Map<string, number>();
    let technicalDebtCount = 0;
    let legacyCount = 0;
    
    for (const component of generalArchitecture.components) {
      const count = componentTypes.get(component.type) || 0;
      componentTypes.set(component.type, count + 1);
      
      if (component.isTechnicalDebt) {
        technicalDebtCount++;
      }
      
      if (component.isLegacy) {
        legacyCount++;
      }
    }
    
    report += `Total Components: **${generalArchitecture.components.length}**\n\n`;
    report += 'Component Types:\n';
    
    for (const [type, count] of componentTypes.entries()) {
      report += `- ${type}: ${count}\n`;
    }
    
    report += `\nTechnical Debt Components: **${technicalDebtCount}** (${Math.round(technicalDebtCount / generalArchitecture.components.length * 100)}% of total)\n`;
    report += `Legacy Components: **${legacyCount}** (${Math.round(legacyCount / generalArchitecture.components.length * 100)}% of total)\n\n`;
    
    // Components by container
    report += '### Components by Container\n\n';
    
    for (const container of generalArchitecture.containers) {
      report += `#### ${container.name}\n\n`;
      
      const containerComponents = generalArchitecture.components.filter(c => c.container === container.name);
      
      if (containerComponents.length === 0) {
        report += 'No components found in this container.\n\n';
        continue;
      }
      
      report += `Contains ${containerComponents.length} components.\n\n`;
      
      // Only show a few representative components to avoid making the report too long
      const topComponents = containerComponents.slice(0, Math.min(5, containerComponents.length));
      
      report += 'Representative components:\n\n';
      report += '| Component | Type | Technical Debt | Legacy |\n';
      report += '|-----------|------|----------------|--------|\n';
      
      for (const component of topComponents) {
        report += `| ${component.name} | ${component.type} | ${component.isTechnicalDebt ? '✓' : ''} | ${component.isLegacy ? '✓' : ''} |\n`;
      }
      
      if (containerComponents.length > 5) {
        report += `\n*... and ${containerComponents.length - 5} more components*\n`;
      }
      
      report += '\n';
    }
    
    // Add technical debt report
    if (technicalDebtCount > 0) {
      report += '### Technical Debt Components\n\n';
      report += '| Component | Type | Container | Path |\n';
      report += '|-----------|------|-----------|------|\n';
      
      for (const component of generalArchitecture.components.filter(c => c.isTechnicalDebt)) {
        report += `| ${component.name} | ${component.type} | ${component.container || 'N/A'} | ${component.path} |\n`;
      }
      
      report += '\n';
    }
    
    // Add legacy report
    if (legacyCount > 0) {
      report += '### Legacy Components\n\n';
      report += '| Component | Type | Container | Path |\n';
      report += '|-----------|------|-----------|------|\n';
      
      for (const component of generalArchitecture.components.filter(c => c.isLegacy)) {
        report += `| ${component.name} | ${component.type} | ${component.container || 'N/A'} | ${component.path} |\n`;
      }
      
      report += '\n';
    }
  } else {
    report += '*General architecture extraction not available.*\n\n';
  }
  
  // Add authentication architecture report
  report += '## Authentication Architecture\n\n';
  
  if (authArchitecture) {
    report += `Authentication Components: **${authArchitecture.components.length}**\n\n`;
    
    // Authentication containers
    if (authArchitecture.containers && authArchitecture.containers.length > 0) {
      report += '### Authentication Containers\n\n';
      report += '| Container | Description | Technology |\n';
      report += '|-----------|-------------|------------|\n';
      
      for (const container of authArchitecture.containers) {
        report += `| ${container.name} | ${container.description} | ${container.technology} |\n`;
      }
      
      report += '\n';
      
      // Components by container
      report += '### Authentication Components by Container\n\n';
      
      for (const container of authArchitecture.containers) {
        report += `#### ${container.name}\n\n`;
        
        const containerComponents = authArchitecture.components.filter(c => c.container === container.name);
        
        if (containerComponents.length === 0) {
          report += 'No authentication components found in this container.\n\n';
          continue;
        }
        
        report += '| Component | Type | Description |\n';
        report += '|-----------|------|-------------|\n';
        
        for (const component of containerComponents) {
          report += `| ${component.name} | ${component.type} | ${component.description || 'N/A'} |\n`;
        }
        
        report += '\n';
      }
    } else {
      // Component summary (fallback if containers not available)
      report += '### Authentication Components\n\n';
      report += '| Component | Type | Description |\n';
      report += '|-----------|------|-------------|\n';
      
      for (const component of authArchitecture.components) {
        report += `| ${component.name} | ${component.type} | ${component.description || 'N/A'} |\n`;
      }
      
      report += '\n';
    }
    
    // Auth flows summary
    report += '### Authentication Flows\n\n';
    report += '| Flow | Description |\n';
    report += '|------|-------------|\n';
    
    for (const flow of authArchitecture.flows) {
      report += `| ${flow.name} | ${flow.description} |\n`;
    }
    
    report += '\n';
    
    // Add note about Clerk migration
    report += '### Clerk Authentication Migration\n\n';
    report += 'The authentication system has been successfully migrated from NextAuth.js to Clerk, ';
    report += 'providing improved user management capabilities, enhanced security features, and better ';
    report += 'multi-tenant support.\n\n';
    
    report += 'The migration includes:\n';
    report += '- Updated middleware for authentication and authorization\n';
    report += '- Webhook handlers for Clerk events\n';
    report += '- Role-based access control using Clerk metadata\n';
    report += '- Database synchronization for user data\n\n';
  } else {
    report += '*Authentication architecture extraction not available.*\n\n';
  }
  
  // Add information about viewing the full architecture
  report += '## Viewing the Complete Architecture\n\n';
  
  // Add direct links to generated Mermaid diagrams
  report += '### Mermaid Diagrams\n\n';
  report += 'The extraction process has generated Mermaid diagrams that can be viewed with any Mermaid renderer:\n\n';
  report += '- [General Architecture Diagram](./architecture-diagram.mmd)\n';
  report += '- [Authentication Architecture Diagram](./auth-architecture.mmd)\n';
  report += '- [Technical Debt Diagram](./technical-debt-diagram.mmd)\n\n';
  
  // Add authentication flow diagrams if available
  if (authArchitecture) {
    report += '### Authentication Flow Diagrams\n\n';
    report += 'Individual authentication flows have been visualized as separate diagrams:\n\n';
    
    for (const flow of authArchitecture.flows) {
      const safeName = flow.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      report += `- [${flow.name}](./auth-flow-${safeName}.mmd)\n`;
    }
    
    report += '\n';
  }
  
  // Add Structurizr information
  report += '### Structurizr Visualization\n\n';
  report += 'To view the complete architecture model with interactive diagrams:\n\n';
  report += '1. Navigate to the project root directory\n';
  report += '2. Run `cd docs/architecture/structurizr && docker-compose up -d`\n';
  report += '3. Open http://localhost:8080 in your browser\n\n';
  
  report += 'The architecture model includes:\n';
  report += '- System Context diagram\n';
  report += '- Container diagram\n';
  report += '- Component diagrams\n';
  report += '- Technical debt and legacy code visualization\n\n';
  
  // Add information about PRD 2.1 alignment
  report += '## Alignment with PRD 2.1\n\n';
  report += 'This architecture extraction is based on PRD 2.1, which organizes the system into the following core containers:\n\n';
  
  report += '1. **WebApplication**: Next.js web application serving the Buildappswith platform\n';
  report += '2. **Database**: Stores user data, builder profiles, session information, and learning content\n';
  report += '3. **AuthenticationService**: Handles user authentication and authorization with Clerk\n';
  report += '4. **PaymentService**: Processes payments for sessions using Stripe\n';
  report += '5. **BookingSystem**: Manages session scheduling and availability\n\n';
  
  report += 'The MVP focuses on establishing Liam Jons\' profile as the foundation for marketplace growth and community building.\n\n';
  
  // Add online Mermaid viewer option
  report += '### Online Mermaid Viewing\n\n';
  report += 'You can also view the generated Mermaid diagrams using online tools:\n\n';
  report += '1. Copy the content of any .mmd file\n';
  report += '2. Paste it into https://mermaid.live\n';
  report += '3. View the rendered diagram\n\n';
  
  return report;
}

/**
 * Generate HTML version of the report for easier viewing
 */
function generateHtmlReport(markdownContent: string, outputPath: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buildappswith Architecture Report</title>
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
  console.log(`HTML report generated at ${outputPath}`);
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

// Run the report generation
generateArchitectureReport().catch(error => {
  console.error('Error during report generation:', error);
  process.exit(1);
});