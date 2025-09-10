@echo off
cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"
echo Setting environment...
set DATABASE_URL=file:./dev.db
echo DATABASE_URL=%DATABASE_URL%
echo.
echo Running database migration...
call npx prisma db push --accept-data-loss
echo.
echo Database migration completed!
echo.
pause