@echo off
cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"
echo 🧪 COMPREHENSIVE DATABASE TESTING
echo ================================
set DATABASE_URL=file:./dev.db
node test-database-comprehensive.js
echo.
echo Test completed. Press any key to continue...
pause