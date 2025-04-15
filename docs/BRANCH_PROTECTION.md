# Branch Protection Guidelines for Buildappswith

This document outlines the recommended branch protection rules for the Buildappswith repository to ensure code quality and maintain a stable deployment pipeline.

## Branch Strategy

The repository uses two primary branches:
- **`develop`**: Development branch where all feature development happens
- **`main`**: Production branch deployed to the live environment

## Recommended Branch Protection Rules

### For `main` branch:

1. **Require pull request reviews before merging**
   - Required number of approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners

2. **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Required status checks:
     - Validate (CI workflow)
     - Test (CI workflow)
     - Accessibility Check (CI workflow)

3. **Require conversation resolution before merging**
   - All conversations must be resolved before a pull request can be merged

4. **Require signed commits**
   - All commits must be signed with GPG keys for security verification

5. **Include administrators**
   - Apply these rules to repository administrators as well

6. **Restrict who can push to matching branches**
   - Allow specific users/teams to push directly (limited to release managers)

7. **Do not allow bypassing the above settings**

### For `develop` branch:

1. **Require pull request reviews before merging**
   - Required number of approvals: 1

2. **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Required status checks:
     - Validate (CI workflow)
     - Test (CI workflow)

3. **Require conversation resolution before merging**
   - All conversations must be resolved before a pull request can be merged

4. **Include administrators**
   - Apply these rules to repository administrators as well

## Implementation Steps

1. Go to the repository on GitHub
2. Navigate to Settings > Branches
3. Add rule for `main` branch
   - Configure settings as specified above
4. Add rule for `develop` branch
   - Configure settings as specified above
5. Save changes

## Additional Recommendations

1. **Create a CODEOWNERS file**
   - Define code owners for critical parts of the codebase
   - Example:
     ```
     # Default owners for everything
     *       @liamj

     # Owners for specific directories
     /app/   @liamj
     ```

2. **Setup Merge Queue (if available)**
   - Enable merge queue to manage concurrent merges
   - Configure auto-merge criteria

3. **Automated Version Bumping**
   - Consider implementing automated version bumping in the CI/CD pipeline
   - This could be based on conventional commits or scheduled releases

Remember that branch protection rules should be balanced between security and developer experience. Adjust these recommendations based on your team size and workflow needs.
