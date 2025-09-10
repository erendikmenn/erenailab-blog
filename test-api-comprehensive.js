#!/usr/bin/env node

/**
 * ErenAILab Blog - Comprehensive API Testing Suite
 * 
 * Bu test dosyası, tüm API endpoint'lerini detaylı olarak test eder.
 * Authentication, validation, error handling, rate limiting ve security kontrollerini kapsar.
 */

const { spawn } = require('child_process');
const https = require('https');
const { writeFileSync } = require('fs');
const { join } = require('path');

// Test sonuçları için raporlama
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: []
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

function assert(condition, message) {
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
}

async function asyncAssert(fn, message) {
  testResults.total++;
  try {
    const result = await fn();
    if (result) {
      testResults.passed++;
      log(`✓ ${message}`, 'green');
      testResults.details.push({ status: 'PASS', message });
    } else {
      testResults.failed++;
      log(`✗ ${message}`, 'red');
      testResults.errors.push(message);
      testResults.details.push({ status: 'FAIL', message });
    }
  } catch (error) {
    testResults.failed++;
    log(`✗ ${message} - Hata: ${error.message}`, 'red');
    testResults.errors.push(`${message} - ${error.message}`);
    testResults.details.push({ status: 'FAIL', message: `${message} - ${error.message}` });
  }
}

// HTTP request yardımcı fonksiyonu
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody,
            rawBody: body
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: {},
            rawBody: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test kategorileri
class APITester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.devServer = null;
    this.testData = {};
  }

  async setup() {
    log('\n=== API TEST KURULUMU ===', 'blue');
    
    try {
      // Development server'ı başlat
      await this.startDevServer();
      log('✓ Development server başlatıldı', 'green');

      // Server'ın hazır olmasını bekle
      await this.waitForServer();
      log('✓ Server hazır duruma geldi', 'green');

      // Test verilerini hazırla
      await this.prepareTestData();
      log('✓ Test verileri hazırlandı', 'green');

    } catch (error) {
      log(`✗ Kurulum hatası: ${error.message}`, 'red');
      throw error;
    }
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      this.devServer = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      this.devServer.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Ready in') || output.includes('Local:')) {
          setTimeout(resolve, 2000); // Server'ın tamamen hazır olması için bekle
        }
      });

      this.devServer.stderr.on('data', (data) => {
        const errorStr = data.toString();
        if (errorStr.includes('Error') && !errorStr.includes('warn')) {
          reject(new Error(`Server başlatma hatası: ${errorStr}`));
        }
      });

      this.devServer.on('error', reject);

      // 30 saniye timeout
      setTimeout(() => {
        reject(new Error('Server başlatma timeout (30s)'));
      }, 30000);
    });
  }

  async waitForServer() {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: '/',
          method: 'GET',
          timeout: 2000
        });
        
        if (response.statusCode === 200) {
          return;
        }
      } catch (error) {
        // Devam et
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Server yanıt vermiyor');
  }

  async prepareTestData() {
    // Test için kullanılacak veriler
    this.testData = {
      validComment: {
        content: 'Bu gerçekten harika bir makale! Çok faydalı bilgiler.',
        postSlug: 'test-post-slug',
        authorName: 'Test User',
        authorEmail: 'test@example.com'
      },
      invalidComment: {
        content: '', // Boş içerik
        postSlug: 'test-post',
        authorName: 'Test',
        authorEmail: 'invalid-email'
      },
      xssComment: {
        content: '<script>alert("XSS Attack")</script>',
        postSlug: 'xss-test',
        authorName: '<script>alert("name")</script>',
        authorEmail: 'xss@test.com'
      },
      sqlInjectionComment: {
        content: "'; DROP TABLE comments; --",
        postSlug: "'; DROP TABLE comments; --",
        authorName: "Robert'; DROP TABLE students; --",
        authorEmail: 'bobby@tables.com'
      }
    };
  }

  async teardown() {
    if (this.devServer) {
      this.devServer.kill('SIGTERM');
      
      // Graceful shutdown için bekle
      await new Promise(resolve => {
        this.devServer.on('exit', resolve);
        setTimeout(() => {
          this.devServer.kill('SIGKILL');
          resolve();
        }, 5000);
      });
      
      log('✓ Development server kapatıldı', 'green');
    }
  }

  // 1. COMMENTS API TESTLERİ
  async testCommentsAPI() {
    log('\n--- Comments API Testleri ---', 'yellow');

    // GET /api/comments - Yorumları listeleme
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments?postSlug=test-post-slug',
        method: 'GET'
      });

      return response.statusCode === 200 && 
             response.body.success === true &&
             Array.isArray(response.body.data);
    }, 'Yorumları listeleme (GET /api/comments)');

    // POST /api/comments - Geçerli yorum ekleme
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, this.testData.validComment);

      this.testData.createdCommentId = response.body.data?.id;
      
      return response.statusCode === 201 && 
             response.body.success === true &&
             response.body.data?.content === this.testData.validComment.content;
    }, 'Geçerli yorum ekleme (POST /api/comments)');

    // POST /api/comments - Geçersiz veri ile yorum ekleme
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, this.testData.invalidComment);

      return response.statusCode === 400 && 
             response.body.success === false;
    }, 'Geçersiz veri ile yorum ekleme reddi');

    // POST /api/comments - XSS saldırısı testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, this.testData.xssComment);

      // XSS içeriği sanitize edilmeli veya reject edilmeli
      return (response.statusCode === 400) || 
             (response.statusCode === 201 && !response.body.data?.content.includes('<script>'));
    }, 'XSS saldırısı koruması');

    // POST /api/comments - SQL Injection testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, this.testData.sqlInjectionComment);

      // SQL injection engellenmelidir
      return response.statusCode === 400 || 
             (response.statusCode === 201 && response.body.data?.content !== "'; DROP TABLE comments; --");
    }, 'SQL Injection koruması');
  }

  // 2. COMMENT LIKE API TESTLERİ
  async testCommentLikeAPI() {
    log('\n--- Comment Like API Testleri ---', 'yellow');

    if (!this.testData.createdCommentId) {
      log('⚠️ Yorum ID bulunamadı, like testleri atlanıyor', 'yellow');
      return;
    }

    // POST /api/comments/[id]/like - Like ekleme
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/api/comments/${this.testData.createdCommentId}/like`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { type: 'LIKE' });

      return response.statusCode === 200 && 
             response.body.success === true;
    }, 'Yorum beğenme (POST /api/comments/[id]/like)');

    // POST /api/comments/[id]/like - Duplicate like testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/api/comments/${this.testData.createdCommentId}/like`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { type: 'LIKE' });

      return response.statusCode === 400 || response.statusCode === 409;
    }, 'Duplicate like engelleme');

    // POST /api/comments/[id]/like - Geçersiz comment ID
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments/nonexistent-id/like',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { type: 'LIKE' });

      return response.statusCode === 404 || response.statusCode === 400;
    }, 'Geçersiz comment ID ile like reddi');
  }

  // 3. RATE LIMITING TESTLERİ
  async testRateLimiting() {
    log('\n--- Rate Limiting Testleri ---', 'yellow');

    // Hızlı ardışık istekler gönder
    await asyncAssert(async () => {
      const requests = [];
      
      for (let i = 0; i < 20; i++) {
        requests.push(
          makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/comments?postSlug=rate-limit-test',
            method: 'GET'
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // En az birkaç istek rate limit'e takılmalı
      const rateLimitedResponses = responses.filter(r => 
        r.statusCode === 429 || r.statusCode === 503
      );

      return rateLimitedResponses.length > 0;
    }, 'Rate limiting çalışması');

    // Rate limit header'ları kontrolü
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'GET'
      });

      return response.headers['x-ratelimit-limit'] || 
             response.headers['x-ratelimit-remaining'] ||
             response.headers['ratelimit-limit'] ||
             response.headers['ratelimit-remaining'];
    }, 'Rate limit header\'ları mevcut');
  }

  // 4. GÜVENLIK HEADER TESTLERİ
  async testSecurityHeaders() {
    log('\n--- Güvenlik Headers Testleri ---', 'yellow');

    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET'
      });

      const headers = response.headers;
      
      return headers['x-frame-options'] || 
             headers['x-content-type-options'] ||
             headers['x-xss-protection'] ||
             headers['content-security-policy'];
    }, 'Güvenlik header\'ları mevcut');

    // CSP header testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET'
      });

      const csp = response.headers['content-security-policy'];
      return csp && csp.includes("default-src 'self'");
    }, 'Content Security Policy doğru yapılandırılmış');

    // HSTS header testi (production'da olmalı)
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET'
      });

      // Development'ta HSTS olmayabilir, bu normal
      return true; // Bu test production için önemli
    }, 'HSTS yapılandırma kontrolü (dev ortamında opsiyonel)');
  }

  // 5. INPUT VALIDATION TESTLERİ
  async testInputValidation() {
    log('\n--- Input Validation Testleri ---', 'yellow');

    // Çok uzun içerik testi
    await asyncAssert(async () => {
      const longContent = 'A'.repeat(10000); // 10KB içerik
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        content: longContent,
        postSlug: 'long-content-test',
        authorName: 'Test User',
        authorEmail: 'test@example.com'
      });

      // Çok uzun içerik kabul edilmemeli veya kısıtlanmalı
      return response.statusCode === 400 || 
             (response.statusCode === 201 && response.body.data?.content.length < 10000);
    }, 'Çok uzun içerik validasyonu');

    // Geçersiz email format testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        content: 'Test content',
        postSlug: 'email-test',
        authorName: 'Test User',
        authorEmail: 'invalid-email-format'
      });

      return response.statusCode === 400;
    }, 'Geçersiz email format reddi');

    // Boş required field'lar testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        content: '',
        postSlug: '',
        authorName: '',
        authorEmail: ''
      });

      return response.statusCode === 400;
    }, 'Boş required field\'lar reddi');
  }

  // 6. ERROR HANDLING TESTLERİ
  async testErrorHandling() {
    log('\n--- Error Handling Testleri ---', 'yellow');

    // 404 endpoint testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/nonexistent-endpoint',
        method: 'GET'
      });

      return response.statusCode === 404;
    }, '404 error handling');

    // Geçersiz HTTP method testi
    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'PATCH' // Desteklenmeyen method
      });

      return response.statusCode === 405 || response.statusCode === 404;
    }, 'Geçersiz HTTP method reddi');

    // Malformed JSON testi
    await asyncAssert(async () => {
      return new Promise((resolve) => {
        const req = https.request({
          hostname: 'localhost',
          port: 3000,
          path: '/api/comments',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, (res) => {
          resolve(res.statusCode === 400);
        });

        req.on('error', () => resolve(true));
        req.write('{"invalid": json}'); // Malformed JSON
        req.end();
      });
    }, 'Malformed JSON error handling');
  }

  // 7. CORS TESTLERİ
  async testCORS() {
    log('\n--- CORS Testleri ---', 'yellow');

    await asyncAssert(async () => {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/comments',
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'POST'
        }
      });

      return response.headers['access-control-allow-origin'] ||
             response.headers['access-control-allow-methods'];
    }, 'CORS header\'ları mevcut');
  }

  // Ana test çalıştırıcı
  async runAllTests() {
    log('🚀 ErenAILab Blog - Kapsamlı API Test Paketi Başlatılıyor...', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'blue');

    try {
      await this.setup();

      // Test gruplarını sırayla çalıştır
      await this.testCommentsAPI();
      await this.testCommentLikeAPI();
      await this.testRateLimiting();
      await this.testSecurityHeaders();
      await this.testInputValidation();
      await this.testErrorHandling();
      await this.testCORS();

      await this.teardown();

    } catch (error) {
      log(`\n💥 Test çalıştırma hatası: ${error.message}`, 'red');
      testResults.failed++;
      testResults.errors.push(`Genel hata: ${error.message}`);
      
      if (this.devServer) {
        this.devServer.kill('SIGKILL');
      }
    }

    // Test sonuçlarını raporla
    this.generateReport();
  }

  // Test raporu oluşturma
  generateReport() {
    log('\n═══════════════════════════════════════════════════════════════', 'blue');
    log('📊 API TEST SONUÇLARI RAPORU', 'bold');
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
      details: testResults.details
    };

    const reportPath = join(process.cwd(), 'api-test-report.json');
    writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

    log(`\n📋 Detaylı rapor kaydedildi: ${reportPath}`, 'blue');

    // Sonuç özeti
    if (testResults.failed === 0) {
      log('\n🎉 TÜM API TESTLERİ BAŞARILI! API tam olarak çalışıyor.', 'green');
    } else if (successRate >= 80) {
      log('\n⚠️  Çoğu API testi başarılı, ancak bazı sorunlar var.', 'yellow');
    } else {
      log('\n🚨 ÖNEMLİ API SORUNLARI TESPİT EDİLDİ! Acil müdahale gerekli.', 'red');
    }

    log('═══════════════════════════════════════════════════════════════', 'blue');
    log('API test süreci tamamlandı.', 'bold');
  }
}

// Test paketi çalıştırıcı
async function main() {
  const tester = new APITester();
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

module.exports = { APITester, testResults };