## [1.0.80] - 2025-04-26

### Removed
- Removed legacy route handling that was used during NextAuth migration
- Removed legacy route validation from middleware configuration
- Removed legacy route imports from middleware index

### Changed
- Updated middleware factory to remove dependency on legacy routes
- Updated middleware tests to use proper mocking approach
- Simplified configuration validation without legacy route checks
- Improved test file structure to set up mocks before imports

### Fixed
- Fixed test failures in middleware test suite
- Corrected mocking implementation in middleware tests
- Resolved "Cannot read properties of undefined" errors
