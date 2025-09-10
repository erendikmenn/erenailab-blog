@echo off
cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"
echo Testing security implementation...
set DATABASE_URL=file:./dev.db
node test-security.js
pause