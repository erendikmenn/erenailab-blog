@echo off
cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"
set DATABASE_URL=file:./dev.db
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=test-secret-key-minimum-32-characters-for-testing

echo Testing Environment Configuration...
node test-environment.js

echo.
echo Testing Database System...
node test-database-comprehensive.js

pause