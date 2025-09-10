#!/usr/bin/env node

/**
 * ErenAILab Blog - Comprehensive Performance Testing Suite
 * 
 * Bu test dosyası, performans metriklerini, build boyutlarını, 
 * load time'ları ve sistem kaynaklarını detaylı olarak test eder.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { writeFileSync } = require('fs');

// Test sonuçları için raporlama
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: [],
  metrics: {}
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

function assert(condition, message, metric = null) {
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
  }
  
  if (metric) {
    testResults.metrics[metric.name] = metric.value;
  }
}

function addMetric(name, value, unit = '') {
  testResults.metrics[name] = { value, unit };
  log(`📊 ${name}: ${value}${unit}`, 'blue');
}

// Dosya boyutu hesaplama
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Dizin boyutu hesaplama
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          calculateSize(fullPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Erişim hatalarını sessizce geç
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

// Shell command çalıştırma
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    process.on('error', reject);
  });
}

// Test kategorileri
class PerformanceTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.buildPath = path.join(this.projectRoot, '.next');
    this.nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    this.srcPath = path.join(this.projectRoot, 'src');
  }

  async setup() {
    log('\n=== PERFORMANS TEST KURULUMU ===', 'blue');
    
    try {
      // Project dizinlerini kontrol et
      const requiredDirs = [this.srcPath];
      for (const dir of requiredDirs) {
        if (fs.existsSync(dir)) {
          log(`✓ ${path.basename(dir)} dizini bulundu`, 'green');
        } else {
          throw new Error(`${dir} dizini bulunamadı`);
        }
      }

    } catch (error) {
      log(`✗ Kurulum hatası: ${error.message}`, 'red');
      throw error;
    }
  }

  // 1. BUILD PERFORMANS TESTLERİ
  async testBuildPerformance() {
    log('\n--- Build Performans Testleri ---', 'yellow');

    // Package.json kontrolü
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    let packageJson = {};
    
    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    }

    // Dependencies sayısı
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    
    addMetric('Production Dependencies', depCount);
    addMetric('Development Dependencies', devDepCount);

    assert(
      depCount <= 50,
      `Production dependency sayısı kabul edilebilir: ${depCount}`,
      { name: 'productionDeps', value: depCount }
    );

    assert(
      devDepCount <= 80,
      `Development dependency sayısı kabul edilebilir: ${devDepCount}`,
      { name: 'devDeps', value: devDepCount }
    );

    // Build denemesi (development mode)
    try {
      log('🔄 Build testi başlatılıyor...', 'yellow');
      const startTime = Date.now();
      
      const buildResult = await runCommand('npm', ['run', 'build'], {
        cwd: this.projectRoot,
        timeout: 300000 // 5 dakika timeout
      });
      
      const buildTime = Date.now() - startTime;
      addMetric('Build Time', Math.round(buildTime / 1000), 's');
      
      assert(
        buildTime < 120000, // 2 dakika
        `Build süresi kabul edilebilir: ${Math.round(buildTime / 1000)}s`,
        { name: 'buildTime', value: buildTime }
      );

      // Build çıktısı analizi
      if (fs.existsSync(this.buildPath)) {
        const buildSize = getDirectorySize(this.buildPath);
        const buildSizeMB = Math.round(buildSize / (1024 * 1024) * 100) / 100;
        
        addMetric('Build Output Size', buildSizeMB, 'MB');
        
        assert(
          buildSizeMB < 500, // 500MB
          `Build çıktı boyutu kabul edilebilir: ${buildSizeMB}MB`,
          { name: 'buildSize', value: buildSizeMB }
        );
      }

    } catch (error) {
      log(`⚠️ Build testi başarısız: ${error.message}`, 'yellow');
      testResults.failed++;
      testResults.errors.push(`Build hatası: ${error.message}`);
    }
  }

  // 2. BUNDLE ANALİZİ TESTLERİ
  async testBundleAnalysis() {
    log('\n--- Bundle Analizi Testleri ---', 'yellow');

    const nextConfigPath = path.join(this.projectRoot, 'next.config.mjs');
    const nextConfigExists = fs.existsSync(nextConfigPath);

    assert(
      nextConfigExists,
      'Next.js config dosyası mevcut',
      { name: 'hasNextConfig', value: nextConfigExists }
    );

    if (nextConfigExists) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Bundle analyzer kontrolü
      const hasBundleAnalyzer = configContent.includes('bundle-analyzer') || 
                               configContent.includes('@next/bundle-analyzer');
      
      if (hasBundleAnalyzer) {
        log('✓ Bundle analyzer yapılandırılmış', 'green');
      } else {
        log('⚠️ Bundle analyzer önerilir', 'yellow');
      }

      // Performance optimizations kontrolü
      const hasOptimizations = configContent.includes('compress') ||
                              configContent.includes('webpack') ||
                              configContent.includes('experimental');

      assert(
        hasOptimizations,
        'Performance optimizasyonları yapılandırılmış',
        { name: 'hasOptimizations', value: hasOptimizations }
      );
    }

    // Static files analizi
    const publicPath = path.join(this.projectRoot, 'public');
    if (fs.existsSync(publicPath)) {
      const publicSize = getDirectorySize(publicPath);
      const publicSizeMB = Math.round(publicSize / (1024 * 1024) * 100) / 100;
      
      addMetric('Public Assets Size', publicSizeMB, 'MB');
      
      assert(
        publicSizeMB < 50, // 50MB
        `Public assets boyutu kabul edilebilir: ${publicSizeMB}MB`,
        { name: 'publicSize', value: publicSizeMB }
      );
    }
  }

  // 3. KAYNAK KOD PERFORMANSI TESTLERİ
  async testSourceCodePerformance() {
    log('\n--- Kaynak Kod Performansı Testleri ---', 'yellow');

    // Source code boyutu
    const srcSize = getDirectorySize(this.srcPath);
    const srcSizeMB = Math.round(srcSize / (1024 * 1024) * 100) / 100;
    
    addMetric('Source Code Size', srcSizeMB, 'MB');
    
    assert(
      srcSizeMB < 10, // 10MB
      `Kaynak kod boyutu kabul edilebilir: ${srcSizeMB}MB`,
      { name: 'sourceSize', value: srcSizeMB }
    );

    // File count analizi
    let fileCount = 0;
    let componentCount = 0;
    let pageCount = 0;
    let totalLOC = 0;

    function scanFiles(dirPath) {
      try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanFiles(fullPath);
          } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
            fileCount++;
            
            if (fullPath.includes('/components/')) {
              componentCount++;
            }
            
            if (fullPath.includes('/app/') || fullPath.includes('/pages/')) {
              pageCount++;
            }

            // Lines of code sayımı
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').filter(line => line.trim().length > 0);
            totalLOC += lines.length;
          }
        }
      } catch (error) {
        // Erişim hatalarını sessizce geç
      }
    }

    scanFiles(this.srcPath);

    addMetric('Total Files', fileCount);
    addMetric('Components', componentCount);
    addMetric('Pages', pageCount);
    addMetric('Lines of Code', totalLOC);

    assert(
      totalLOC < 50000, // 50K LOC
      `Lines of code kabul edilebilir: ${totalLOC}`,
      { name: 'totalLOC', value: totalLOC }
    );

    // Average file size
    const avgFileSize = Math.round(totalLOC / fileCount);
    addMetric('Average File Size', avgFileSize, ' lines');
    
    assert(
      avgFileSize < 500, // 500 line per file
      `Ortalama dosya boyutu kabul edilebilir: ${avgFileSize} lines`,
      { name: 'avgFileSize', value: avgFileSize }
    );
  }

  // 4. DEPENDENCY ANALİZİ TESTLERİ
  async testDependencyAnalysis() {
    log('\n--- Dependency Analizi Testleri ---', 'yellow');

    // node_modules boyutu
    if (fs.existsSync(this.nodeModulesPath)) {
      const nodeModulesSize = getDirectorySize(this.nodeModulesPath);
      const nodeModulesSizeGB = Math.round(nodeModulesSize / (1024 * 1024 * 1024) * 100) / 100;
      
      addMetric('node_modules Size', nodeModulesSizeGB, 'GB');
      
      assert(
        nodeModulesSizeGB < 2, // 2GB
        `node_modules boyutu kabul edilebilir: ${nodeModulesSizeGB}GB`,
        { name: 'nodeModulesSize', value: nodeModulesSizeGB }
      );

      // Package count
      try {
        const packages = fs.readdirSync(this.nodeModulesPath);
        const packageCount = packages.filter(pkg => !pkg.startsWith('.')).length;
        
        addMetric('Installed Packages', packageCount);
        
        assert(
          packageCount < 2000, // 2000 package
          `Yüklü paket sayısı kabul edilebilir: ${packageCount}`,
          { name: 'packageCount', value: packageCount }
        );
      } catch (error) {
        log(`⚠️ Package sayımı yapılamadı: ${error.message}`, 'yellow');
      }
    }

    // Package.lock analizi
    const packageLockPath = path.join(this.projectRoot, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      const lockSize = getFileSize(packageLockPath);
      const lockSizeMB = Math.round(lockSize / (1024 * 1024) * 100) / 100;
      
      addMetric('package-lock.json Size', lockSizeMB, 'MB');
      
      assert(
        lockSizeMB < 50, // 50MB
        `package-lock.json boyutu kabul edilebilir: ${lockSizeMB}MB`,
        { name: 'lockFileSize', value: lockSizeMB }
      );
    }
  }

  // 5. MEMORY ve CPU KULLANIMI TESTLERİ
  async testResourceUsage() {
    log('\n--- Kaynak Kullanımı Testleri ---', 'yellow');

    // Node.js process memory kullanımı
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024) * 100) / 100;
    const heapTotalMB = Math.round(memoryUsage.heapTotal / (1024 * 1024) * 100) / 100;
    
    addMetric('Heap Used', heapUsedMB, 'MB');
    addMetric('Heap Total', heapTotalMB, 'MB');

    assert(
      heapUsedMB < 500, // 500MB
      `Heap kullanımı kabul edilebilir: ${heapUsedMB}MB`,
      { name: 'heapUsed', value: heapUsedMB }
    );

    // System info
    const cpuCount = require('os').cpus().length;
    const totalMemoryGB = Math.round(require('os').totalmem() / (1024 * 1024 * 1024));
    const freeMemoryGB = Math.round(require('os').freemem() / (1024 * 1024 * 1024));
    
    addMetric('CPU Cores', cpuCount);
    addMetric('Total Memory', totalMemoryGB, 'GB');
    addMetric('Free Memory', freeMemoryGB, 'GB');

    assert(
      freeMemoryGB >= 1, // En az 1GB boş memory
      `Yeterli boş memory mevcut: ${freeMemoryGB}GB`,
      { name: 'freeMemory', value: freeMemoryGB }
    );
  }

  // 6. NETWORK ve ASSET PERFORMANSI TESTLERİ
  async testAssetPerformance() {
    log('\n--- Asset Performansı Testleri ---', 'yellow');

    // CSS dosyaları
    const globalsCssPath = path.join(this.srcPath, 'app', 'globals.css');
    if (fs.existsSync(globalsCssPath)) {
      const cssSize = getFileSize(globalsCssPath);
      const cssSizeKB = Math.round(cssSize / 1024 * 100) / 100;
      
      addMetric('globals.css Size', cssSizeKB, 'KB');
      
      assert(
        cssSizeKB < 100, // 100KB
        `CSS dosya boyutu kabul edilebilir: ${cssSizeKB}KB`,
        { name: 'cssSize', value: cssSizeKB }
      );
    }

    // Image optimizasyonu kontrolü
    let imageFiles = [];
    const publicPath = path.join(this.projectRoot, 'public');
    
    if (fs.existsSync(publicPath)) {
      function findImages(dirPath) {
        try {
          const items = fs.readdirSync(dirPath);
          
          for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              findImages(fullPath);
            } else if (item.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
              imageFiles.push(fullPath);
            }
          }
        } catch (error) {
          // Erişim hatalarını sessizce geç
        }
      }
      
      findImages(publicPath);
    }

    addMetric('Image Files', imageFiles.length);

    if (imageFiles.length > 0) {
      let totalImageSize = 0;
      let largeImages = 0;
      
      for (const imagePath of imageFiles) {
        const size = getFileSize(imagePath);
        totalImageSize += size;
        
        if (size > 1024 * 1024) { // 1MB
          largeImages++;
        }
      }

      const avgImageSizeKB = Math.round(totalImageSize / imageFiles.length / 1024 * 100) / 100;
      addMetric('Average Image Size', avgImageSizeKB, 'KB');
      
      assert(
        avgImageSizeKB < 500, // 500KB
        `Ortalama resim boyutu kabul edilebilir: ${avgImageSizeKB}KB`,
        { name: 'avgImageSize', value: avgImageSizeKB }
      );

      assert(
        largeImages === 0,
        `Büyük resim dosyası sayısı: ${largeImages}`,
        { name: 'largeImages', value: largeImages }
      );
    }
  }

  // 7. CODE QUALITY ve COMPLEXITY TESTLERİ
  async testCodeComplexity() {
    log('\n--- Code Complexity Testleri ---', 'yellow');

    let totalComplexity = 0;
    let functionCount = 0;
    let classCount = 0;
    let todoCount = 0;
    let fixmeCount = 0;

    function analyzeFile(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Function sayımı
        const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || [];
        functionCount += functions.length;
        
        // Class sayımı
        const classes = content.match(/class\s+\w+/g) || [];
        classCount += classes.length;
        
        // TODO/FIXME sayımı
        todoCount += (content.match(/TODO|@todo/gi) || []).length;
        fixmeCount += (content.match(/FIXME|@fixme/gi) || []).length;
        
        // Basit complexity analizi
        const conditionals = (content.match(/if|else|switch|case|for|while|\?/g) || []).length;
        const nestedBlocks = (content.match(/\{[\s\S]*?\{/g) || []).length;
        totalComplexity += conditionals + nestedBlocks;
        
      } catch (error) {
        // Dosya okuma hatalarını sessizce geç
      }
    }

    // Tüm TypeScript dosyalarını analiz et
    function scanForAnalysis(dirPath) {
      try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanForAnalysis(fullPath);
          } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
            analyzeFile(fullPath);
          }
        }
      } catch (error) {
        // Erişim hatalarını sessizce geç
      }
    }

    scanForAnalysis(this.srcPath);

    addMetric('Total Functions', functionCount);
    addMetric('Total Classes', classCount);
    addMetric('TODO Comments', todoCount);
    addMetric('FIXME Comments', fixmeCount);

    const avgComplexity = functionCount > 0 ? Math.round(totalComplexity / functionCount * 100) / 100 : 0;
    addMetric('Average Complexity', avgComplexity);

    assert(
      avgComplexity < 10, // Complexity threshold
      `Ortalama kod karmaşıklığı kabul edilebilir: ${avgComplexity}`,
      { name: 'avgComplexity', value: avgComplexity }
    );

    assert(
      fixmeCount === 0,
      `FIXME yorumu sayısı: ${fixmeCount}`,
      { name: 'fixmeCount', value: fixmeCount }
    );
  }

  // Ana test çalıştırıcı
  async runAllTests() {
    log('🚀 ErenAILab Blog - Kapsamlı Performans Test Paketi Başlatılıyor...', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'blue');

    const startTime = Date.now();

    try {
      await this.setup();

      // Test gruplarını sırayla çalıştır
      await this.testBuildPerformance();
      await this.testBundleAnalysis();
      await this.testSourceCodePerformance();
      await this.testDependencyAnalysis();
      await this.testResourceUsage();
      await this.testAssetPerformance();
      await this.testCodeComplexity();

    } catch (error) {
      log(`\n💥 Test çalıştırma hatası: ${error.message}`, 'red');
      testResults.failed++;
      testResults.errors.push(`Genel hata: ${error.message}`);
    }

    const totalTime = Date.now() - startTime;
    addMetric('Total Test Time', Math.round(totalTime / 1000), 's');

    // Test sonuçlarını raporla
    this.generateReport();
  }

  // Test raporu oluşturma
  generateReport() {
    log('\n═══════════════════════════════════════════════════════════════', 'blue');
    log('📊 PERFORMANS TEST SONUÇLARI RAPORU', 'bold');
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

    log(`\n📊 Performance Metrikleri:`, 'blue');
    Object.entries(testResults.metrics).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value !== undefined) {
        log(`   ${key}: ${value.value}${value.unit || ''}`, 'blue');
      } else {
        log(`   ${key}: ${value}`, 'blue');
      }
    });

    // Detaylı raporu dosyaya yaz
    const detailedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        successRate: `${successRate}%`
      },
      metrics: testResults.metrics,
      errors: testResults.errors,
      details: testResults.details
    };

    const reportPath = path.join(process.cwd(), 'performance-test-report.json');
    writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

    log(`\n📋 Detaylı rapor kaydedildi: ${reportPath}`, 'blue');

    // Sonuç özeti
    if (testResults.failed === 0) {
      log('\n🎉 TÜM PERFORMANS TESTLERİ BAŞARILI! Sistem performansı mükemmel.', 'green');
    } else if (successRate >= 80) {
      log('\n⚠️  Performans testlerinin çoğu başarılı, ancak optimizasyonlar yapılabilir.', 'yellow');
    } else {
      log('\n🚨 PERFORMANS SORUNLARI TESPİT EDİLDİ! Optimizasyon gerekli.', 'red');
    }

    log('═══════════════════════════════════════════════════════════════', 'blue');
    log('Performans test süreci tamamlandı.', 'bold');
  }
}

// Test paketi çalıştırıcı
async function main() {
  const tester = new PerformanceTester();
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

module.exports = { PerformanceTester, testResults };