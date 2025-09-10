const fs = require('fs');

// Files to delete
const filesToDelete = [
  'src/components/analytics/translation-analytics.tsx',
  'src/hooks/useTranslationPerformance.ts',
  'src/components/ui/translation-indicators.tsx',
  'src/hooks/useTranslation.ts',
  'src/hooks/useAutoTranslate.ts'
];

// Directories to delete 
const dirsToDelete = [
  'src/components/analytics',
  'src/components/ui'
];

// Delete individual files
filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`Deleted: ${file}`);
  }
});

// Delete directories if empty or only contain translation files
dirsToDelete.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        fs.rmdirSync(dir);
        console.log(`Deleted empty directory: ${dir}`);
      }
    } catch (e) {
      console.log(`Could not delete directory ${dir}: ${e.message}`);
    }
  }
});

console.log('Translation files cleanup completed');