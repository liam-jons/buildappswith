# Enhanced Unused Code Analyzer

This directory contains the enhanced unused code analyzer script for the Buildappswith platform.

## Usage

```bash
# Basic usage
./enhanced-unused-code-analyzer.sh

# With verbose output
./enhanced-unused-code-analyzer.sh --verbose

# With fix mode (backup unused files)
./enhanced-unused-code-analyzer.sh --fix

# Custom scan depth
./enhanced-unused-code-analyzer.sh --depth=4

# Combine options
./enhanced-unused-code-analyzer.sh --verbose --fix --depth=4
```

## NPM Scripts

For convenience, the following npm scripts are available:

```bash
# Basic analysis
pnpm arch:unused:enhanced

# With fix mode
pnpm arch:unused:fix

# With verbose output
pnpm arch:unused:verbose
```

## Documentation

For comprehensive documentation, please see:

- [UNUSED_CODE_ANALYZER_GUIDE.md](/docs/engineering/UNUSED_CODE_ANALYZER_GUIDE.md)

## Key Features

- Accurate detection of unused components with support for modern import patterns
- Proper handling of Next.js conventions (pages, layouts, API routes)
- Domain-based classification for systematic cleanup
- Multiple output formats (Markdown, HTML, JSON, Mermaid)
- Interactive backup mode for safely moving unused components

## Comparison to Original Analyzer

The enhanced analyzer provides several improvements over the original:

1. **Higher Accuracy**: Better detection of imports, JSX usage, and Next.js conventions
2. **Lower False Positives**: Validation of file existence and proper component typing
3. **Better Organization**: Domain-based classification for easier cleanup
4. **More Detailed Reports**: Multiple formats with comprehensive information
5. **Interactive Mode**: Option to safely backup files before removal

For most use cases, this enhanced analyzer should be preferred over the original.
