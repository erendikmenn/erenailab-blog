const fs = require('fs');
const path = require('path');

// Create nested directories
const dirs = [
  'src/app/api/admin/comments/[id]',
  'src/app/api/admin/comments/[id]/moderate',
  'src/app/api/admin/users',
  'src/app/api/admin/users/[id]',
  'src/app/api/admin/users/[id]/role',
  'src/app/api/admin/users/[id]/status',
  'src/app/api/admin/logs'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('All directories created successfully!');