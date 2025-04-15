# Buildappswith CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment of the Buildappswith platform.

## Workflow Overview

### Continuous Integration (`ci.yml`)

This workflow runs on all pull requests to `develop` and `main` branches, as well as direct pushes to these branches. It performs the following checks:

1. **Validation Job**:
   - Code linting
   - TypeScript type checking
   - Build verification

2. **Test Job**:
   - Unit tests (to be implemented)
   - Integration tests (to be implemented)

### Continuous Deployment (`cd.yml`)

This workflow runs on pushes to `develop` and `main` branches and handles deployment to Vercel:

- Pushes to `develop` → Deploy to preview environment
- Pushes to `main` → Deploy to production environment

## Required Secrets

The following secrets must be configured in your GitHub repository settings:

- `VERCEL_TOKEN`: An API token from Vercel with deployment permissions
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: The ID of your Vercel project

## Environment Variables

Environment variables are managed in Vercel's project settings. The `.env.example` file in the project root documents all required variables.

## Branch Protection Rules

For proper CI/CD workflow, the following branch protection rules are recommended:

### `main` branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require the `validate` and `test` jobs to pass
- Do not allow force pushes
- Do not allow deletion of the branch

### `develop` branch
- Require status checks to pass before merging
- Require the `validate` and `test` jobs to pass
- Allow rebase merging of approved pull requests
