const fs = require('fs');
const path = require('path');

// Delete LanguageContext
const languageContextPath = 'src/contexts/LanguageContext.tsx';
if (fs.existsSync(languageContextPath)) {
  fs.unlinkSync(languageContextPath);
  console.log('Deleted: LanguageContext.tsx');
}

// Delete translate API directory
const translateApiPath = 'src/app/api/translate';
if (fs.existsSync(translateApiPath)) {
  fs.rmSync(translateApiPath, { recursive: true, force: true });
  console.log('Deleted: translate API directory');
}

console.log('Cleanup completed');