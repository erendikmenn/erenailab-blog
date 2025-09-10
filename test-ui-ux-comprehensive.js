#!/usr/bin/env node

/**
 * ErenAILab Blog - Comprehensive UI/UX Testing Suite
 * 
 * Bu test dosyası, UI komponenlerini, sayfa yapılarını, erişilebilirlik,
 * responsive design ve kullanıcı deneyimini detaylı olarak test eder.
 */

const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');

// Test sonuçları için raporlama
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: [],
  recommendations: []
};

// Test yardımcı fonksiyonları
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, message, recommendation = null) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log(`✓ ${message}`, 'green');
    testResults.details.push({ status: 'PASS', message });
  } else {
    testResults.failed++;
    log(`✗ ${message}`, 'red');
    testResults.errors.push(message);
    testResults.details.push({ status: 'FAIL', message });
    
    if (recommendation) {
      testResults.recommendations.push(recommendation);
      log(`  💡 Öneri: ${recommendation}`, 'yellow');
    }
  }
}

function addRecommendation(message) {
  testResults.recommendations.push(message);
  log(`💡 ${message}`, 'yellow');
}

// Dosya okuma yardımcı fonksiyonu
function readFileSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Dizin tarama yardımcı fonksiyonu
function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  function scan(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Erişim hatalarını sessizce geç
    }
  }
  
  scan(dirPath);
  return files;
}

// Test kategorileri
class UITester {
  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.componentsPath = path.join(this.srcPath, 'components');
    this.pagesPath = path.join(this.srcPath, 'app');
    this.allFiles = [];
    this.componentFiles = [];
    this.pageFiles = [];
  }

  async setup() {
    log('\n=== UI/UX TEST KURULUMU ===', 'blue');
    
    try {
      // Dosyaları tara
      this.allFiles = scanDirectory(this.srcPath);
      this.componentFiles = scanDirectory(this.componentsPath);
      this.pageFiles = scanDirectory(this.pagesPath);
      
      log(`✓ ${this.allFiles.length} dosya tarandı`, 'green');
      log(`✓ ${this.componentFiles.length} component dosyası bulundu`, 'green');
      log(`✓ ${this.pageFiles.length} page dosyası bulundu`, 'green');

    } catch (error) {
      log(`✗ Kurulum hatası: ${error.message}`, 'red');
      throw error;
    }
  }

  // 1. COMPONENT YAPISI TESTLERİ
  async testComponentStructure() {
    log('\n--- Component Yapısı Testleri ---', 'yellow');

    // UI components klasör yapısı
    const expectedUIComponents = [
      'button.tsx', 'card.tsx', 'input.tsx', 'textarea.tsx', 'avatar.tsx'
    ];

    for (const component of expectedUIComponents) {
      const componentPath = path.join(this.componentsPath, 'ui', component);
      assert(
        fs.existsSync(componentPath),
        `UI component mevcut: ${component}`,
        `${component} component'i eksik. UI tutarlılığı için gerekli.`
      );
    }

    // Feature components kontrolü
    const expectedFeatureComponents = [
      'comments', 'layout', 'blog', 'contact'
    ];

    for (const feature of expectedFeatureComponents) {
      const featurePath = path.join(this.componentsPath, feature);
      assert(
        fs.existsSync(featurePath),
        `Feature component klasörü mevcut: ${feature}`,
        `${feature} feature component klasörü eksik.`
      );
    }

    // Component export kontrolü
    let properExports = 0;
    for (const file of this.componentFiles) {
      const content = readFileSync(file);
      if (content) {
        const hasDefaultExport = content.includes('export default');
        const hasNamedExport = content.includes('export {') || content.includes('export const') || content.includes('export function');
        
        if (hasDefaultExport || hasNamedExport) {
          properExports++;
        }
      }
    }

    assert(
      properExports >= this.componentFiles.length * 0.9,
      'Component\'lerin %90+ uygun export yapısına sahip',
      'Bazı component\'lerde export yapısı eksik veya hatalı.'
    );
  }

  // 2. TYPESCRIPT ve TIP GÜVENLİĞİ TESTLERİ
  async testTypeScript() {
    log('\n--- TypeScript ve Tip Güvenliği Testleri ---', 'yellow');

    // TypeScript dosya oranı
    const tsFiles = this.allFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    const tsRatio = tsFiles.length / this.allFiles.length;

    assert(
      tsRatio >= 0.8,
      `Dosyaların %${(tsRatio * 100).toFixed(1)}'i TypeScript kullanıyor`,
      'Daha fazla dosyada TypeScript kullanılmalı.'
    );

    // Interface/Type tanımları kontrolü
    let interfaceCount = 0;
    let typeCount = 0;
    let propsTyped = 0;

    for (const file of tsFiles) {
      const content = readFileSync(file);
      if (content) {
        interfaceCount += (content.match(/interface\s+\w+/g) || []).length;
        typeCount += (content.match(/type\s+\w+/g) || []).length;
        
        // Props typing kontrolü
        if (content.includes('React.FC') || content.includes('FunctionComponent') || 
            content.match(/\w+:\s*\{\s*\w+:/)) {
          propsTyped++;
        }
      }
    }

    assert(
      interfaceCount + typeCount >= 10,
      `${interfaceCount + typeCount} interface/type tanımı bulundu`,
      'Daha fazla tip tanımı kullanılarak tip güvenliği artırılabilir.'
    );

    assert(
      propsTyped >= this.componentFiles.length * 0.7,
      'Component\'lerin %70+ props typing kullanıyor',
      'Daha fazla component\'te props typing kullanılmalı.'
    );
  }

  // 3. ERİŞİLEBİLİRLİK (ACCESSIBILITY) TESTLERİ
  async testAccessibility() {
    log('\n--- Erişilebilirlik Testleri ---', 'yellow');

    let altAttributeCount = 0;
    let ariaLabelCount = 0;
    let semanticElementCount = 0;
    let headingStructureCount = 0;
    let formLabelCount = 0;

    for (const file of this.allFiles) {
      const content = readFileSync(file);
      if (content) {
        // Alt attribute kontrolü
        altAttributeCount += (content.match(/alt=['"]/g) || []).length;
        
        // ARIA labels kontrolü
        ariaLabelCount += (content.match(/aria-label=['"]/g) || []).length;
        
        // Semantic HTML elementleri
        const semanticElements = ['<header', '<nav', '<main', '<section', '<article', '<aside', '<footer'];
        semanticElementCount += semanticElements.reduce((count, element) => 
          count + (content.match(new RegExp(element, 'g')) || []).length, 0
        );
        
        // Heading yapısı
        headingStructureCount += (content.match(/<h[1-6]/g) || []).length;
        
        // Form label'ları
        formLabelCount += (content.match(/<label/g) || []).length;
      }
    }

    assert(
      altAttributeCount >= 5,
      `${altAttributeCount} alt attribute bulundu`,
      'Tüm img elementlerinde alt attribute kullanılmalı.'
    );

    assert(
      ariaLabelCount >= 3,
      `${ariaLabelCount} aria-label attribute bulundu`,
      'Daha fazla interaktif element\'te aria-label kullanılmalı.'
    );

    assert(
      semanticElementCount >= 10,
      `${semanticElementCount} semantic HTML element bulundu`,
      'Daha fazla semantic HTML elementi kullanılmalı (header, nav, main, section, etc.).'
    );

    assert(
      headingStructureCount >= 5,
      `${headingStructureCount} heading elementi bulundu`,
      'Proper heading hierarchy (h1-h6) kullanılmalı.'
    );
  }

  // 4. RESPONSIVE DESIGN TESTLERİ
  async testResponsiveDesign() {
    log('\n--- Responsive Design Testleri ---', 'yellow');

    // Tailwind CSS kullanımı
    let responsiveClassCount = 0;
    let flexboxUsage = 0;
    let gridUsage = 0;

    for (const file of this.allFiles) {
      const content = readFileSync(file);
      if (content) {
        // Responsive breakpoint sınıfları
        const responsiveClasses = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
        responsiveClassCount += responsiveClasses.reduce((count, cls) => 
          count + (content.match(new RegExp(cls, 'g')) || []).length, 0
        );
        
        // Flexbox kullanımı
        flexboxUsage += (content.match(/flex|justify-|items-/g) || []).length;
        
        // Grid kullanımı
        gridUsage += (content.match(/grid|grid-cols|grid-rows/g) || []).length;
      }
    }

    assert(
      responsiveClassCount >= 20,
      `${responsiveClassCount} responsive class kullanımı bulundu`,
      'Daha fazla responsive breakpoint kullanılmalı (sm:, md:, lg:, xl:).'
    );

    assert(
      flexboxUsage >= 30,
      `${flexboxUsage} flexbox kullanımı bulundu`,
      'Modern layout için daha fazla flexbox kullanılmalı.'
    );

    // Viewport meta tag kontrolü
    let hasViewportMeta = false;
    const layoutFile = path.join(this.pagesPath, 'layout.tsx');
    const layoutContent = readFileSync(layoutFile);
    if (layoutContent) {
      hasViewportMeta = layoutContent.includes('viewport') && layoutContent.includes('width=device-width');
    }

    assert(
      hasViewportMeta,
      'Viewport meta tag mevcut',
      'layout.tsx\'de viewport meta tag eklenmeli.'
    );
  }

  // 5. PERFORMANS ve BEST PRACTICES TESTLERİ
  async testPerformance() {
    log('\n--- Performans ve Best Practices Testleri ---', 'yellow');

    let dynamicImportCount = 0;
    let memoUsage = 0;
    let useCallbackUsage = 0;
    let imageOptimizationCount = 0;

    for (const file of this.allFiles) {
      const content = readFileSync(file);
      if (content) {
        // Dynamic imports
        dynamicImportCount += (content.match(/import\(/g) || []).length;
        
        // React performance hooks
        memoUsage += (content.match(/React\.memo|useMemo/g) || []).length;
        useCallbackUsage += (content.match(/useCallback/g) || []).length;
        
        // Next.js Image component
        imageOptimizationCount += (content.match(/from ['"]next\/image['"]/g) || []).length;
      }
    }

    assert(
      dynamicImportCount >= 2,
      `${dynamicImportCount} dynamic import kullanımı bulundu`,
      'Code splitting için daha fazla dynamic import kullanılmalı.'
    );

    assert(
      memoUsage >= 3,
      `${memoUsage} memoization kullanımı bulundu`,
      'Performance için React.memo/useMemo kullanılmalı.'
    );

    assert(
      imageOptimizationCount >= 1,
      `${imageOptimizationCount} Next.js Image component kullanımı`,
      'Image optimization için next/image component\'i kullanılmalı.'
    );
  }

  // 6. FORM ve VALIDATION TESTLERİ
  async testForms() {
    log('\n--- Form ve Validation Testleri ---', 'yellow');

    let formCount = 0;
    let inputValidationCount = 0;
    let errorHandlingCount = 0;
    let formHookUsage = 0;

    for (const file of this.allFiles) {
      const content = readFileSync(file);
      if (content) {
        // Form elementleri
        formCount += (content.match(/<form/g) || []).length;
        
        // Input validation
        inputValidationCount += (content.match(/required|pattern|minLength|maxLength/g) || []).length;
        
        // Error handling
        errorHandlingCount += (content.match(/error|Error|invalid|Invalid/g) || []).length;
        
        // React Hook Form usage
        formHookUsage += (content.match(/useForm|register|handleSubmit/g) || []).length;
      }
    }

    assert(
      formCount >= 2,
      `${formCount} form elementi bulundu`,
      'Contact ve comment formları kontrol edilmeli.'
    );

    assert(
      inputValidationCount >= 5,
      `${inputValidationCount} input validation kullanımı`,
      'Daha fazla form validasyonu eklenmeli.'
    );

    assert(
      formHookUsage >= 3,
      `${formHookUsage} React Hook Form kullanımı`,
      'Form yönetimi için React Hook Form kullanılmalı.'
    );
  }

  // 7. SEO ve META TAG TESTLERİ
  async testSEO() {
    log('\n--- SEO ve Meta Tag Testleri ---', 'yellow');

    let metadataUsage = 0;
    let titleUsage = 0;
    let descriptionUsage = 0;
    let structuredDataCount = 0;

    for (const file of this.pageFiles) {
      const content = readFileSync(file);
      if (content) {
        // Next.js metadata
        metadataUsage += (content.match(/export.*metadata/g) || []).length;
        
        // Title tags
        titleUsage += (content.match(/title.*:/g) || []).length;
        
        // Description meta
        descriptionUsage += (content.match(/description.*:/g) || []).length;
        
        // Structured data
        structuredDataCount += (content.match(/application\/ld\+json/g) || []).length;
      }
    }

    assert(
      metadataUsage >= 3,
      `${metadataUsage} sayfa metadata export'u bulundu`,
      'Tüm sayfalarda metadata export edilmeli.'
    );

    assert(
      titleUsage >= 3,
      `${titleUsage} title tanımı bulundu`,
      'Her sayfada unique title olmalı.'
    );

    assert(
      descriptionUsage >= 3,
      `${descriptionUsage} description tanımı bulundu`,
      'Her sayfada meta description olmalı.'
    );
  }

  // 8. DESIGN SYSTEM ve TUTARLILIK TESTLERİ
  async testDesignSystem() {
    log('\n--- Design System ve Tutarlılık Testleri ---', 'yellow');

    let colorConsistency = 0;
    let spacingConsistency = 0;
    let fontSizeConsistency = 0;
    let componentReusability = 0;

    for (const file of this.allFiles) {
      const content = readFileSync(file);
      if (content) {
        // Color usage (Tailwind colors)
        const colorClasses = ['bg-', 'text-', 'border-', 'ring-'];
        colorConsistency += colorClasses.reduce((count, cls) => 
          count + (content.match(new RegExp(cls, 'g')) || []).length, 0
        );
        
        // Spacing consistency
        const spacingClasses = ['p-', 'm-', 'px-', 'py-', 'mx-', 'my-'];
        spacingConsistency += spacingClasses.reduce((count, cls) => 
          count + (content.match(new RegExp(cls, 'g')) || []).length, 0
        );
        
        // Font size consistency
        fontSizeConsistency += (content.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g) || []).length;
        
        // Component reusability (import from components)
        componentReusability += (content.match(/from ['"]\.\.?\/.*(components|ui)/g) || []).length;
      }
    }

    assert(
      colorConsistency >= 50,
      `${colorConsistency} tutarlı renk kullanımı`,
      'Design system renkleri daha tutarlı kullanılmalı.'
    );

    assert(
      spacingConsistency >= 80,
      `${spacingConsistency} tutarlı spacing kullanımı`,
      'Spacing değerleri daha sistematik kullanılmalı.'
    );

    assert(
      componentReusability >= 20,
      `${componentReusability} component import kullanımı`,
      'Daha fazla component reuse edilmeli.'
    );
  }

  // 9. I18N ve ÇOK DİLLİLİK TESTLERİ
  async testInternationalization() {
    log('\n--- i18n ve Çok Dillililik Testleri ---', 'yellow');

    let localeUsage = 0;
    let enRoutes = 0;
    let trContent = 0;

    // Locale folder structure kontrolü
    const enFolder = path.join(this.pagesPath, 'en');
    const hasEnFolder = fs.existsSync(enFolder);

    assert(
      hasEnFolder,
      'English locale klasörü mevcut (/en)',
      'İngilizce route\'ları için /en klasörü oluşturulmalı.'
    );

    if (hasEnFolder) {
      const enFiles = scanDirectory(enFolder);
      enRoutes = enFiles.length;
    }

    for (const file of this.allFiles) {
      const content = readFileSync(file);
      if (content) {
        // Locale usage
        localeUsage += (content.match(/locale|tr|en|language/gi) || []).length;
        
        // Turkish content detection
        const turkishChars = ['ş', 'ğ', 'ü', 'ö', 'ç', 'ı'];
        if (turkishChars.some(char => content.includes(char))) {
          trContent++;
        }
      }
    }

    assert(
      enRoutes >= 3,
      `${enRoutes} English route dosyası bulundu`,
      'Daha fazla sayfa için English version eklenmeli.'
    );

    assert(
      trContent >= 5,
      `${trContent} dosyada Türkçe içerik bulundu`,
      'Turkish content tutarlılığı kontrol edilmeli.'
    );
  }

  // Ana test çalıştırıcı
  async runAllTests() {
    log('🚀 ErenAILab Blog - Kapsamlı UI/UX Test Paketi Başlatılıyor...', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'blue');

    try {
      await this.setup();

      // Test gruplarını sırayla çalıştır
      await this.testComponentStructure();
      await this.testTypeScript();
      await this.testAccessibility();
      await this.testResponsiveDesign();
      await this.testPerformance();
      await this.testForms();
      await this.testSEO();
      await this.testDesignSystem();
      await this.testInternationalization();

    } catch (error) {
      log(`\n💥 Test çalıştırma hatası: ${error.message}`, 'red');
      testResults.failed++;
      testResults.errors.push(`Genel hata: ${error.message}`);
    }

    // Test sonuçlarını raporla
    this.generateReport();
  }

  // Test raporu oluşturma
  generateReport() {
    log('\n═══════════════════════════════════════════════════════════════', 'blue');
    log('📊 UI/UX TEST SONUÇLARI RAPORU', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'blue');

    const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(2) : 0;

    log(`\n📈 Genel İstatistikler:`, 'yellow');
    log(`   Toplam Test: ${testResults.total}`);
    log(`   Başarılı: ${testResults.passed}`, 'green');
    log(`   Başarısız: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    log(`   Başarı Oranı: %${successRate}`, successRate >= 95 ? 'green' : successRate >= 80 ? 'yellow' : 'red');

    if (testResults.errors.length > 0) {
      log(`\n❌ Hatalar:`, 'red');
      testResults.errors.forEach((error, index) => {
        log(`   ${index + 1}. ${error}`, 'red');
      });
    }

    if (testResults.recommendations.length > 0) {
      log(`\n💡 Öneriler (${testResults.recommendations.length} adet):`, 'yellow');
      [...new Set(testResults.recommendations)].forEach((rec, index) => {
        log(`   ${index + 1}. ${rec}`, 'yellow');
      });
    }

    // Detaylı raporu dosyaya yaz
    const detailedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        successRate: `${successRate}%`
      },
      errors: testResults.errors,
      recommendations: [...new Set(testResults.recommendations)],
      details: testResults.details
    };

    const reportPath = path.join(process.cwd(), 'ui-ux-test-report.json');
    writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

    log(`\n📋 Detaylı rapor kaydedildi: ${reportPath}`, 'blue');

    // Sonuç özeti
    if (testResults.failed === 0) {
      log('\n🎉 TÜM UI/UX TESTLERİ BAŞARILI! Arayüz kalitesi mükemmel.', 'green');
    } else if (successRate >= 80) {
      log('\n⚠️  UI/UX testlerinin çoğu başarılı, ancak iyileştirmeler yapılabilir.', 'yellow');
    } else {
      log('\n🚨 UI/UX KALİTESİNDE SORUNLAR VAR! İyileştirmeler gerekli.', 'red');
    }

    log('═══════════════════════════════════════════════════════════════', 'blue');
    log('UI/UX test süreci tamamlandı.', 'bold');
  }
}

// Test paketi çalıştırıcı
async function main() {
  const tester = new UITester();
  await tester.runAllTests();
  
  // Exit code belirleme
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Hata yakalama
process.on('unhandledRejection', (error) => {
  log(`\n💥 İşlenmeyen hata: ${error.message}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`\n💥 Yakalanmayan istisna: ${error.message}`, 'red');
  process.exit(1);
});

// Ana fonksiyonu çalıştır
if (require.main === module) {
  main();
}

module.exports = { UITester, testResults };