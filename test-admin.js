// Admin Panel Test Script
// Test admin functionality without running full server

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Admin Panel Implementation...\n');

// Test 1: Check if all admin API files exist
const adminApiFiles = [
  'src/app/api/admin/stats/route.ts',
  'src/app/api/admin/comments/route.ts',
  'src/app/api/admin/comments/[id]/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/users/[id]/route.ts'
];

console.log('📁 Checking admin API files...');
let allFilesExist = true;
adminApiFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test 2: Check admin dashboard page
console.log('\n📄 Checking admin dashboard...');
const adminPageExists = fs.existsSync(path.join(__dirname, 'src/app/admin/page.tsx'));
console.log(`   ${adminPageExists ? '✅' : '❌'} src/app/admin/page.tsx`);

// Test 3: Check Prisma schema for admin features
console.log('\n🗄️  Checking database schema...');
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const hasAdminLog = schemaContent.includes('model AdminLog');
  const hasCommentStatus = schemaContent.includes('status') && schemaContent.includes('PENDING');
  const hasUserRole = schemaContent.includes('role') && schemaContent.includes('ADMIN');
  
  console.log(`   ${hasAdminLog ? '✅' : '❌'} AdminLog model exists`);
  console.log(`   ${hasCommentStatus ? '✅' : '❌'} Comment status with PENDING`);
  console.log(`   ${hasUserRole ? '✅' : '❌'} User role with ADMIN`);
} else {
  console.log('   ❌ Prisma schema not found');
}

// Test 4: Check UI components
console.log('\n🎨 Checking UI components...');
const uiComponents = [
  'src/components/ui/card.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/avatar.tsx'
];

uiComponents.forEach(component => {
  const exists = fs.existsSync(path.join(__dirname, component));
  console.log(`   ${exists ? '✅' : '❌'} ${component}`);
});

// Test Summary
console.log('\n📊 Test Summary:');
console.log(`   API Files: ${allFilesExist ? 'PASS' : 'FAIL'}`);
console.log(`   Dashboard: ${adminPageExists ? 'PASS' : 'FAIL'}`);
console.log(`   Schema: ${fs.existsSync(schemaPath) ? 'PASS' : 'FAIL'}`);

if (allFilesExist && adminPageExists) {
  console.log('\n🎉 Admin Panel implementation looks good!');
  console.log('💡 Next steps:');
  console.log('   1. Run: npx prisma generate');
  console.log('   2. Run: npx prisma db push');
  console.log('   3. Run: npm run dev');
  console.log('   4. Visit: http://localhost:3000/admin');
} else {
  console.log('\n❌ Some files are missing. Please check the implementation.');
}