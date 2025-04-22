# CI/CD Pipeline Documentation

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Buildappswith platform, including branch management, naming conventions, and deployment procedures.

## Branch Management Strategy

Buildappswith uses a trunk-based development approach with two primary branches:

### Primary Branches

1. **`main`** - Production branch
   - Contains code that is deployed to the production environment
   - Protected and requires pull request approval
   - Always deployable and stable

2. **`develop`** - Development branch
   - Integration branch for features and fixes
   - Deployed to development/staging environment
   - Protected but with less strict rules than `main`

### Feature Branches

Feature branches are created from `develop` and follow a naming convention:

- **`feature/[feature-name]`** - For new features
- **`bugfix/[issue-name]`** - For bug fixes
- **`hotfix/[issue-name]`** - For urgent production fixes
- **`chore/[task-name]`** - For maintenance tasks
- **`doc/[doc-name]`** - For documentation updates

Example: `feature/user-authentication` or `bugfix/navbar-alignment`

## CI/CD Workflow

### 1. Continuous Integration (CI)

The CI pipeline is triggered on:
- Every push to `develop` and `main`
- Every pull request to `develop` and `main`

Steps in the CI pipeline:
1. **Validation**
   - Dependency installation
   - Linting
   - Type checking
   - Build verification

2. **Testing**
   - Unit tests
   - Integration tests
   - Component tests

3. **Accessibility Checks**
   - WCAG 2.1 AA compliance verification

Configuration file: `.github/workflows/ci.yml`

### 2. Continuous Deployment (CD)

The CD pipeline is triggered on:
- Every push to `develop` (deploys to development)
- Every push to `main` (deploys to production)
- Manual trigger via workflow dispatch

Steps in the CD pipeline:
1. **Build Preparation**
   - Dependency installation
   - Environment setup

2. **Vercel Deployment**
   - Environment variable setup
   - Build and deploy

3. **Post-Deployment Tasks**
   - Database synchronization (for production)
   - Changelog updates

Configuration file: `.github/workflows/cd.yml`

## Development Workflow

### 1. Starting a New Feature

```bash
# Ensure you're on develop and it's up to date
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name

# Develop, commit, and push your changes
git add .
git commit -m "feat: implement your feature"
git push origin feature/your-feature-name
```

### 2. Creating a Pull Request

- Create a pull request from your feature branch to `develop`
- Ensure CI checks pass
- Request review from team members
- Address feedback and make necessary changes

### 3. Merging to Develop

- Once approved, merge the pull request to `develop`
- The CD pipeline will automatically deploy to the development environment

### 4. Production Release

- Create a pull request from `develop` to `main`
- Ensure CI checks pass
- Request review from team members
- Once approved, merge the pull request to `main`
- The CD pipeline will automatically deploy to production

## Hotfix Procedure

For urgent fixes that need to be applied to production immediately:

1. **Create a hotfix branch from `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **Implement the fix, commit, and push**
   ```bash
   git add .
   git commit -m "fix: resolve critical issue"
   git push origin hotfix/critical-issue
   ```

3. **Create a pull request directly to `main`**
   - Ensure CI checks pass
   - Request expedited review

4. **After merging to `main`, also merge to `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git merge main
   git push origin develop
   ```

## Environment Configuration

### Development Environment

- URL: `https://dev.buildappswith.com`
- Automatically updated on merges to `develop`
- Contains latest features and fixes
- May include experimental features

### Production Environment

- URL: `https://buildappswith.com`
- Automatically updated on merges to `main`
- Contains only stable, tested features
- Requires stricter review process

## Deployment Verification

After each deployment, verify:

1. **Application functionality**
   - Core features work as expected
   - No regression issues

2. **Performance**
   - Page load times
   - API response times

3. **Security**
   - Authentication flows
   - Authorization controls

## Rollback Procedure

If issues are detected after deployment:

1. **Identify the issue scope**
   - Critical (requires immediate rollback)
   - Non-critical (can be fixed with forward deployment)

2. **For critical issues:**
   - Revert the merge in GitHub
   - Manually trigger the CD pipeline

3. **For non-critical issues:**
   - Create a bugfix branch
   - Follow normal development workflow with expedited review

## Required Scripts

Several scripts are available to facilitate the CI/CD process:

- **`scripts/check-git-branches.js`** - Verifies branch alignment before deployment
- **`scripts/production-checklist.js`** - Pre-deployment checks for production
- **`scripts/fix-build-issues.js`** - Resolves common build issues
- **`scripts/deploy.sh`** - Deployment automation script
- **`test-build.sh`** - Local build testing

For detailed information on each script, refer to [SCRIPTS_DOCUMENTATION.md](./SCRIPTS_DOCUMENTATION.md).

## Version Management

Buildappswith uses semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** - Incompatible API changes
- **MINOR** - Added functionality in a backward-compatible manner
- **PATCH** - Backward-compatible bug fixes

Version numbers are maintained in `package.json` and should be updated accordingly before merging to `main`.

## Best Practices

1. **Atomic Commits**
   - Keep commits small and focused
   - Use conventional commit format: `type: description`
   - Examples: `feat: add user profile`, `fix: correct button alignment`

2. **Branch Hygiene**
   - Regularly sync feature branches with `develop`
   - Delete branches after merging
   - Keep branches short-lived

3. **Pull Request Quality**
   - Include clear descriptions
   - Reference related issues
   - Include screenshots for UI changes
   - Request review from appropriate team members

4. **Code Quality**
   - Ensure all tests pass
   - Address all linting issues
   - Maintain proper code documentation
   - Follow project coding standards
