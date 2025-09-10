const fs = require('fs');

// Delete language-toggle.tsx
const languageTogglePath = 'src/components/language-toggle.tsx';
if (fs.existsSync(languageTogglePath)) {
  fs.unlinkSync(languageTogglePath);
  console.log('Deleted: language-toggle.tsx');
}

console.log('Language toggle cleanup completed');