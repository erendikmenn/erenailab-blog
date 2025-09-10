@echo off
cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"
echo Running database test...
set DATABASE_URL=file:./dev.db
node test-db.js
pause