#!/usr/bin/env node

/**
 * ErenAILab Blog - Master Test Suite Runner
 * 
 * Bu dosya tüm test suite'lerini çalıştırır ve kapsamlı bir final raporu oluşturur.
 * Database, API, UI/UX, Performance, Security testlerini içerir.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');

// Test sonuçları için raporlama
const masterResults = {
  timestamp: new Date().toISOString(),
  totalTestSuites: 0,
  passedSuites: 0,
  failedSuites: 0,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  suiteResults: [],
  recommendations: [],
  errors: []
};

// Test yardımcı fonksiyonları
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test suite çalıştırıcı
function runTestSuite(scriptName, description) {
  return new Promise((resolve) => {
    log(`\n🔄 ${description} başlatılıyor...`, 'cyan');
    
    const startTime = Date.now();
    const testProcess = spawn('node', [scriptName], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    testProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      const result = {
        suite: scriptName,
        description,
        exitCode: code,
        duration,
        success: code === 0,
        stdout,
        stderr
      };

      // JSON rapor dosyasını okumaya çalış
      const reportFiles = {
        'test-database-comprehensive.js': 'database-test-report.json',
        'test-api-comprehensive.js': 'api-test-report.json',
        'test-ui-ux-comprehensive.js': 'ui-ux-test-report.json',
        'test-performance-comprehensive.js': 'performance-test-report.json'
      };

      const reportFile = reportFiles[scriptName];
      if (reportFile && fs.existsSync(reportFile)) {
        try {
          const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
          result.summary = reportData.summary;
          result.metrics = reportData.metrics;
          result.recommendations = reportData.recommendations || [];
          result.errors = reportData.errors || [];
        } catch (error) {
          log(`⚠️ ${reportFile} okunamadı: ${error.message}`, 'yellow');
        }
      }

      if (result.success) {
        log(`✅ ${description} başarıyla tamamlandı (${duration}s)`, 'green');
        masterResults.passedSuites++;
      } else {
        log(`❌ ${description} başarısız oldu (${duration}s)`, 'red');
        masterResults.failedSuites++;
        masterResults.errors.push(`${description}: Exit code ${code}`);
      }

      masterResults.suiteResults.push(result);
      resolve(result);
    });

    testProcess.on('error', (error) => {
      log(`💥 ${description} çalıştırılamadı: ${error.message}`, 'red');
      
      const result = {
        suite: scriptName,
        description,
        exitCode: -1,
        duration: 0,
        success: false,
        error: error.message
      };

      masterResults.failedSuites++;
      masterResults.errors.push(`${description}: ${error.message}`);
      masterResults.suiteResults.push(result);
      resolve(result);
    });
  });
}

// Ana master test runner
class MasterTestRunner {
  constructor() {
    this.testSuites = [
      {
        script: 'test-database-comprehensive.js',
        description: 'Database Comprehensive Tests',
        required: true
      },
      {
        script: 'test-ui-ux-comprehensive.js',
        description: 'UI/UX Components Tests',
        required: true
      },
      {
        script: 'test-performance-comprehensive.js',
        description: 'Performance & Load Tests',
        required: true
      },
      {
        script: 'test-api-comprehensive.js',
        description: 'API Endpoints Tests',
        required: false // API testleri server'a bağımlı
      }
    ];
  }

  async runAllTests() {
    log('🚀 ErenAILab Blog - MASTER TEST SUITE BAŞLATILIYOR', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'blue');
    log(`📅 Test Zamanı: ${new Date().toLocaleString('tr-TR')}`, 'cyan');
    log(`🖥️  Test Ortamı: ${process.platform} ${process.arch}`, 'cyan');
    log(`⚡ Node.js: ${process.version}`, 'cyan');
    log('═══════════════════════════════════════════════════════════════', 'blue');

    masterResults.totalTestSuites = this.testSuites.length;
    const startTime = Date.now();

    // Test suite'lerini sırayla çalıştır
    for (const suite of this.testSuites) {
      // Test dosyasının varlığını kontrol et
      if (!fs.existsSync(suite.script)) {
        log(`⚠️ ${suite.script} bulunamadı, atlanıyor...`, 'yellow');
        if (suite.required) {
          masterResults.failedSuites++;
          masterResults.errors.push(`Required test suite not found: ${suite.script}`);
        }
        continue;
      }

      await runTestSuite(suite.script, suite.description);
      
      // Test suite'ler arasında kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalTime = Date.now() - startTime;
    
    // Sonuçları topla
    this.aggregateResults();
    
    // Final raporu oluştur
    this.generateMasterReport(totalTime);
  }

  aggregateResults() {
    for (const result of masterResults.suiteResults) {
      if (result.summary) {
        masterResults.totalTests += result.summary.total || 0;
        masterResults.passedTests += result.summary.passed || 0;
        masterResults.failedTests += result.summary.failed || 0;
      }

      if (result.recommendations) {
        masterResults.recommendations.push(...result.recommendations);
      }

      if (result.errors) {
        masterResults.errors.push(...result.errors);
      }
    }
  }

  generateMasterReport(totalTime) {
    log('\n\n🎯 MASTER TEST SUITE - FINAL RAPOR', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'magenta');

    // Genel İstatistikler
    const suiteSuccessRate = masterResults.totalTestSuites > 0 ? 
      ((masterResults.passedSuites / masterResults.totalTestSuites) * 100).toFixed(1) : 0;
    
    const testSuccessRate = masterResults.totalTests > 0 ? 
      ((masterResults.passedTests / masterResults.totalTests) * 100).toFixed(1) : 0;

    log(`\n📊 GENEL İSTATİSTİKLER:`, 'yellow');
    log(`   Test Suite'leri: ${masterResults.passedSuites}/${masterResults.totalTestSuites} (%${suiteSuccessRate})`, 
        suiteSuccessRate >= 80 ? 'green' : 'red');
    log(`   Toplam Testler: ${masterResults.passedTests}/${masterResults.totalTests} (%${testSuccessRate})`, 
        testSuccessRate >= 80 ? 'green' : 'red');
    log(`   Toplam Süre: ${Math.round(totalTime / 1000)}s`, 'cyan');

    // Suite başına detay
    log(`\n📋 SUITE DETAYLARI:`, 'yellow');
    for (const result of masterResults.suiteResults) {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}s`;
      const summary = result.summary ? 
        ` (${result.summary.passed}/${result.summary.total} tests)` : '';
      
      log(`   ${status} ${result.description}: ${duration}${summary}`, 
          result.success ? 'green' : 'red');
    }

    // Performans Metrikleri
    const perfSuite = masterResults.suiteResults.find(r => r.suite.includes('performance'));
    if (perfSuite && perfSuite.metrics) {
      log(`\n⚡ PERFORMANS METRİKLERİ:`, 'yellow');
      const metrics = perfSuite.metrics;
      
      if (metrics['Source Code Size']) {
        log(`   📦 Kaynak Kod: ${metrics['Source Code Size'].value}${metrics['Source Code Size'].unit}`, 'cyan');
      }
      if (metrics['Total Functions']) {
        log(`   🔧 Toplam Fonksiyon: ${metrics['Total Functions']}`, 'cyan');
      }
      if (metrics['Production Dependencies']) {
        log(`   📚 Dependencies: ${metrics['Production Dependencies']}`, 'cyan');
      }
      if (metrics['node_modules Size']) {
        log(`   💽 node_modules: ${metrics['node_modules Size'].value}${metrics['node_modules Size'].unit}`, 'cyan');
      }
    }

    // UI/UX Kalite Skoru
    const uiSuite = masterResults.suiteResults.find(r => r.suite.includes('ui-ux'));
    if (uiSuite && uiSuite.summary) {
      const uiScore = uiSuite.summary.successRate;
      log(`\n🎨 UI/UX KALİTE SKORU: ${uiScore}`, 
          parseFloat(uiScore) >= 80 ? 'green' : 'yellow');
    }

    // Database Güvenilirlik
    const dbSuite = masterResults.suiteResults.find(r => r.suite.includes('database'));
    if (dbSuite && dbSuite.summary) {
      const dbScore = dbSuite.summary.successRate;
      log(`🗄️  DATABASE GÜVENİLİRLİK: ${dbScore}`, 
          parseFloat(dbScore) >= 95 ? 'green' : 'yellow');
    }

    // Kritik Hatalar
    if (masterResults.errors.length > 0) {
      log(`\n🚨 KRİTİK SORUNLAR (${masterResults.errors.length} adet):`, 'red');
      masterResults.errors.slice(0, 5).forEach((error, index) => {
        log(`   ${index + 1}. ${error}`, 'red');
      });
      
      if (masterResults.errors.length > 5) {
        log(`   ... ve ${masterResults.errors.length - 5} tane daha`, 'red');
      }
    }

    // Öneriler
    const uniqueRecommendations = [...new Set(masterResults.recommendations)];
    if (uniqueRecommendations.length > 0) {
      log(`\n💡 İYİLEŞTİRME ÖNERİLERİ (${uniqueRecommendations.length} adet):`, 'yellow');
      uniqueRecommendations.slice(0, 8).forEach((rec, index) => {
        log(`   ${index + 1}. ${rec}`, 'yellow');
      });
      
      if (uniqueRecommendations.length > 8) {
        log(`   ... ve ${uniqueRecommendations.length - 8} tane daha`, 'yellow');
      }
    }

    // Genel Değerlendirme
    log(`\n🏆 GENEL DEĞERLENDİRME:`, 'bold');
    
    if (suiteSuccessRate >= 90 && testSuccessRate >= 95) {
      log('   🎉 MÜKEMMELLİK SEVİYESİ - Sistem production-ready!', 'green');
    } else if (suiteSuccessRate >= 80 && testSuccessRate >= 80) {
      log('   ✅ İYİ SEVİYE - Küçük iyileştirmelerle production-ready.', 'yellow');
    } else if (suiteSuccessRate >= 60 && testSuccessRate >= 70) {
      log('   ⚠️  ORTA SEVİYE - Önemli iyileştirmeler gerekli.', 'yellow');
    } else {
      log('   🚨 DÜŞÜK SEVİYE - Kapsamlı iyileştirmeler gerekli!', 'red');
    }

    // Production readiness
    const isProductionReady = suiteSuccessRate >= 80 && testSuccessRate >= 85 && 
                             masterResults.errors.filter(e => e.includes('Critical')).length === 0;
    
    log(`\n🚀 PRODUCTION HAZIRLİĞİ: ${isProductionReady ? 'HAZIR ✅' : 'HENÜZ HAZIR DEĞİL ⚠️'}`, 
        isProductionReady ? 'green' : 'yellow');

    // Master raporu dosyaya kaydet
    const masterReport = {
      ...masterResults,
      totalTime: Math.round(totalTime / 1000),
      suiteSuccessRate: `${suiteSuccessRate}%`,
      testSuccessRate: `${testSuccessRate}%`,
      isProductionReady,
      generatedAt: new Date().toISOString()
    };

    const masterReportPath = path.join(process.cwd(), 'master-test-report.json');
    writeFileSync(masterReportPath, JSON.stringify(masterReport, null, 2));

    log(`\n📋 Master test raporu: ${masterReportPath}`, 'blue');
    log('═══════════════════════════════════════════════════════════════', 'magenta');
    log('🎯 Master Test Suite tamamlandı!', 'bold');
  }
}

// Ana fonksiyon
async function main() {
  const runner = new MasterTestRunner();
  await runner.runAllTests();
  
  // Exit code belirleme
  const hasFailures = masterResults.failedSuites > 0 || 
                     (masterResults.totalTests > 0 && masterResults.failedTests / masterResults.totalTests > 0.2);
  
  process.exit(hasFailures ? 1 : 0);
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

module.exports = { MasterTestRunner, masterResults };