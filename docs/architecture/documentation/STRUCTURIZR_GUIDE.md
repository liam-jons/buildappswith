# Structurizr Guide for Buildappswith

This guide explains how to use Structurizr for working with the Buildappswith architecture documentation.

## Setting Up Structurizr Lite

### Prerequisites

- Docker installed on your machine
- Git repository cloned locally

### Running Structurizr Lite

1. Navigate to the architecture documentation directory:
   ```bash
   cd /Users/liamj/Documents/Development/buildappswith/docs/architecture/structurizr
   ```

2. Start the Structurizr Lite container:
   ```bash
   docker-compose up
   ```

3. Access Structurizr in your browser:
   ```
   http://localhost:8080
   ```

4. When finished, stop the container:
   ```bash
   docker-compose down
   ```

## Working with the DSL

The architecture is defined in the `workspace.dsl` file using the Structurizr Domain Specific Language.

### Basic DSL Structure

```
workspace "Name" "Description" {
    model {
        // People
        user = person "User" "Description"
        
        // Systems
        system = softwareSystem "System" "Description"
        
        // Relationships
        user -> system "Uses"
    }
    
    views {
        // View definitions
    }
}
```

### Key Elements

1. **People**: External users or roles
   ```
   client = person "Client" "Description"
   ```

2. **Software Systems**: High-level systems
   ```
   buildappswith = softwareSystem "Buildappswith" "Description"
   ```

3. **Containers**: Applications or data stores within a system
   ```
   webapp = container "Web Application" "Description" "Technology"
   ```

4. **Components**: Parts of a container
   ```
   controller = component "Controller" "Description" "Technology"
   ```

5. **Relationships**: Connections between elements
   ```
   client -> webapp "Uses"
   ```

### Common DSL Tasks

#### Adding a New Person

```
newRole = person "Role Name" "Role Description"
```

#### Adding a New System

```
newSystem = softwareSystem "System Name" "System Description"
```

#### Adding a Container to a System

```
system {
    newContainer = container "Container Name" "Container Description" "Technology"
}
```

#### Creating Relationships

```
person -> system "Relationship Description"
system -> otherSystem "Relationship Description"
```

#### Creating Views

```
views {
    systemContext mySystem "ContextName" {
        include *
        autoLayout
    }
}
```

## Modifying the Architecture

When making changes to the architecture:

1. Update the relevant sections of the `workspace.dsl` file
2. Save the file
3. Refresh your browser to see the changes
4. Commit the changes to version control

## Best Practices

1. **Incremental Updates**: Make small, focused changes
2. **Clear Descriptions**: Provide meaningful descriptions for all elements
3. **Consistent Naming**: Use consistent naming conventions
4. **Technology Tags**: Include relevant technology information
5. **Relationship Clarity**: Make relationship descriptions action-oriented

## Common Issues

### Missing Relationships

If elements aren't connected in diagrams, check that you've defined relationships between them.

### Diagram Layout

If the automatic layout isn't optimal:
- Try adjusting the element positions manually
- Consider adding layout hints
- Break complex diagrams into simpler views

### Changes Not Appearing

If changes don't appear after saving:
- Refresh the browser
- Check for syntax errors in the DSL
- Restart the Structurizr container if necessary

## Reference

- [Structurizr DSL Documentation](https://docs.structurizr.com/dsl)
- [C4 Model](https://c4model.com/)
