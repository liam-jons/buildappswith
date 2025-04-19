@echo off
echo ===== Buildappswith DB Schema Fix Tool =====
echo.

echo Running fix-prisma-types.js...
node ./scripts/fix-prisma-types.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database schema update completed successfully!
    echo.
    echo You can now verify the changes by running:
    echo   pnpm type-check
) else (
    echo.
    echo Database schema update failed. See error messages above.
)

pause
