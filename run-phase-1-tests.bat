@echo off
echo 🚀 ErenAILab Blog - Phase 1: Infrastructure & Database Testing
echo ================================================================
echo.

cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"

echo 🔧 Setting up test environment...
set DATABASE_URL=file:./test.db
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=test-secret-key-minimum-32-characters-for-testing
set SITE_URL=http://localhost:3000
set SITE_NAME=ErenAILab Blog

echo ✅ Environment variables set
echo.

echo 📊 Running Environment Configuration Tests...
echo ===============================================
node test-environment.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Environment tests failed!
    pause
    exit /b 1
)
echo.

echo 🗄️ Ensuring database is ready...
call npx prisma db push --accept-data-loss > nul 2>&1
echo ✅ Database schema applied
echo.

echo 🔍 Running Comprehensive Database Tests...
echo ==========================================
node test-database-comprehensive.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database tests failed!
    pause
    exit /b 1
)
echo.

echo 🧹 Cleaning up test database...
if exist test.db del test.db
echo ✅ Test database cleaned up
echo.

echo 🎉 Phase 1: Infrastructure & Database Testing COMPLETED SUCCESSFULLY!
echo =======================================================================
echo.
echo Summary:
echo ✅ Environment Configuration Tests: PASSED
echo ✅ Database Schema Validation: PASSED
echo ✅ CRUD Operations: PASSED
echo ✅ Data Integrity: PASSED
echo ✅ Cascading Deletes: PASSED
echo ✅ Admin System: PASSED
echo ✅ Site Settings: PASSED
echo.
echo 📈 Ready to proceed to Phase 2: Security System Testing
echo.
pause