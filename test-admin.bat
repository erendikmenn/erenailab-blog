@echo off
cd /d "c:\Users\dikme\OneDrive\Desktop\Blog\erenailab-blog"
echo Generating Prisma client...
npx prisma generate
echo.
echo Building project...
npm run build
echo.
echo Starting development server...
npm run dev
pause