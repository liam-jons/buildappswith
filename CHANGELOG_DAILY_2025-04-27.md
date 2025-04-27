# Daily Changelog for 2025-04-27

## Version 1.0.125

### Added

- **Unused Code Analyzer**: Created comprehensive tooling to identify potentially unused components and analyze architectural complexity
  - New script `create-unused-features-analyzer.ts` for analyzing component usage and architectural complexity
  - Implementation of metrics for component usage scores and complexity scores
  - Special focus on AI Timeline feature for targeted cleanup
  - Generation of HTML and Markdown reports with actionable insights
  - Mermaid diagram generation for visual representation of unused components

- **Architecture Decision Record**: Added ADR `0025-unused-code-analyzer.md` documenting the approach for identifying unused code

- **NPM Script**: Added `arch:unused` command to run the unused code analyzer

### Updated

- **Documentation**: Enhanced `CODEBASE_CLEANUP_STRATEGY.md` with information about the completed analysis tools

### Technical Details

- Added usage score calculation based on incoming component references
- Implemented complexity metrics based on dependencies, file size, and component type
- Created pattern inconsistency detection to identify architectural inconsistencies
- Added cyclic dependency detection to find problematic circular references
- Enhanced container coupling analysis to identify potential boundaries to strengthen
- Created HTML report generation for better readability

### Implementation Notes

The unused code analyzer builds on the existing architecture extraction tools to provide actionable insights for code cleanup. It analyzes the codebase in multiple dimensions:

1. **Component Usage**: Detecting components that have no incoming references
2. **Page/Route Links**: Finding pages and routes that are not linked from navigation
3. **Architectural Complexity**: Calculating metrics for complexity and coupling
4. **Pattern Consistency**: Identifying inconsistencies in implementation patterns

The initial focus is on the AI Timeline feature as a potential candidate for removal or simplification.

### Usage Instructions

To run the unused code analyzer:

```bash
pnpm arch:unused
```

Reports will be generated in the `docs/architecture/analysis` directory with both Markdown and HTML formats.
