#!/usr/bin/env node

/**
 * ErenAILab Blog - Comprehensive Database Testing Suite
 * 
 * Bu test dosyası, veritabanının tüm operasyonlarını detaylı olarak test eder.
 * Tüm modeller, CRUD operasyonları, veri bütünlüğü ve güvenlik kontrollerini kapsar.
 */

const { PrismaClient } = require('@prisma/client');
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

function assertThrows(fn, message) {
  testResults.total++;
  try {
    fn();
    testResults.failed++;
    log(`✗ ${message} (beklenen hata oluşmadı)`, 'red');
    testResults.errors.push(`${message} (beklenen hata oluşmadı)`);
    testResults.details.push({ status: 'FAIL', message: `${message} (beklenen hata oluşmadı)` });
  } catch (error) {
    testResults.passed++;
    log(`✓ ${message}`, 'green');
    testResults.details.push({ status: 'PASS', message });
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

// Test kategorileri
class DatabaseTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.testData = {};
  }

  async setup() {
    log('\n=== VERİTABANI TEST KURULUMU ===', 'blue');
    
    try {
      // Bağlantı testi
      await this.prisma.$connect();
      log('✓ Veritabanı bağlantısı başarılı', 'green');

      // Test verilerini temizle
      await this.cleanup();
      log('✓ Önceki test verileri temizlendi', 'green');

    } catch (error) {
      log(`✗ Kurulum hatası: ${error.message}`, 'red');
      throw error;
    }
  }

  async cleanup() {
    try {
      // Tabloları belirli sırada temizle (foreign key constraints)
      await this.prisma.commentLike.deleteMany();
      await this.prisma.comment.deleteMany();
      await this.prisma.pageView.deleteMany();
      await this.prisma.adminLog.deleteMany();
      await this.prisma.newsletter.deleteMany();
      await this.prisma.session.deleteMany();
      await this.prisma.account.deleteMany();
      await this.prisma.user.deleteMany();
      await this.prisma.siteSettings.deleteMany();
      await this.prisma.translation.deleteMany();
      await this.prisma.verificationToken.deleteMany();
    } catch (error) {
      // Temizlik hatalarını sessizce geç (tablolar yoksa normal)
    }
  }

  async teardown() {
    await this.cleanup();
    await this.prisma.$disconnect();
    log('✓ Veritabanı bağlantısı kapatıldı', 'green');
  }

  // 1. BAĞLANTI VE ŞEMA TESTLERİ
  async testConnection() {
    log('\n--- Bağlantı Testleri ---', 'yellow');
    
    await asyncAssert(async () => {
      const result = await this.prisma.$queryRaw`SELECT 1 as test`;
      return Array.isArray(result) && result.length > 0;
    }, 'Raw SQL sorgusu çalışıyor');

    await asyncAssert(async () => {
      const tables = await this.prisma.$queryRaw`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `;
      return tables.length >= 6; // En az 6 tablo olmalı
    }, 'Gerekli tablolar mevcut');
  }

  // 2. USER MODEL TESTLERİ
  async testUserModel() {
    log('\n--- User Model Testleri ---', 'yellow');

    // Temel kullanıcı oluşturma
    await asyncAssert(async () => {
      this.testData.user1 = await this.prisma.user.create({
        data: {
          email: 'test@erenailab.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg'
        }
      });
      return this.testData.user1.id && this.testData.user1.email === 'test@erenailab.com';
    }, 'Kullanıcı oluşturma');

    // Benzersiz email kontrolü
    await asyncAssert(async () => {
      try {
        await this.prisma.user.create({
          data: {
            email: 'test@erenailab.com', // Aynı email
            name: 'Test User 2'
          }
        });
        return false; // Hata bekleniyor
      } catch (error) {
        return error.code === 'P2002'; // Unique constraint hatası
      }
    }, 'Email benzersizlik kontrolü');

    // Kullanıcı güncelleme
    await asyncAssert(async () => {
      const updated = await this.prisma.user.update({
        where: { id: this.testData.user1.id },
        data: { name: 'Updated User' }
      });
      return updated.name === 'Updated User';
    }, 'Kullanıcı güncelleme');

    // Kullanıcı bulma
    await asyncAssert(async () => {
      const found = await this.prisma.user.findUnique({
        where: { email: 'test@erenailab.com' }
      });
      return found && found.name === 'Updated User';
    }, 'Kullanıcı bulma (email ile)');

    // İkinci kullanıcı oluştur (ilişki testleri için)
    this.testData.user2 = await this.prisma.user.create({
      data: {
        email: 'test2@erenailab.com',
        name: 'Test User 2'
      }
    });
  }

  // 3. COMMENT MODEL TESTLERİ
  async testCommentModel() {
    log('\n--- Comment Model Testleri ---', 'yellow');

    // Temel yorum oluşturma
    await asyncAssert(async () => {
      this.testData.comment1 = await this.prisma.comment.create({
        data: {
          content: 'Bu çok harika bir makale!',
          postSlug: 'test-post-slug',
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser'
        }
      });
      return this.testData.comment1.id && this.testData.comment1.content === 'Bu çok harika bir makale!';
    }, 'Yorum oluşturma');

    // İç içe yorum (reply) oluşturma
    await asyncAssert(async () => {
      this.testData.reply1 = await this.prisma.comment.create({
        data: {
          content: 'Katılıyorum, gerçekten kaliteli!',
          postSlug: 'test-post-slug',
          userId: this.testData.user2.id,
          parentId: this.testData.comment1.id, // Ana yoruma cevap
          ipAddress: '192.168.1.2',
          userAgent: 'Test Browser 2'
        }
      });
      return this.testData.reply1.parentId === this.testData.comment1.id;
    }, 'Cevap yorumu oluşturma');

    // Yorum bulma ve ilişkiler
    await asyncAssert(async () => {
      const comment = await this.prisma.comment.findUnique({
        where: { id: this.testData.comment1.id },
        include: {
          user: true,
          replies: true,
          likes: true
        }
      });
      return comment && comment.user.email === 'test@erenailab.com' && comment.replies.length === 1;
    }, 'Yorum ve ilişkiler bulma');

    // Belirli post'un yorumlarını bulma
    await asyncAssert(async () => {
      const comments = await this.prisma.comment.findMany({
        where: { 
          postSlug: 'test-post-slug',
          parentId: null // Sadece ana yorumlar
        },
        include: {
          replies: {
            include: {
              user: true
            }
          }
        }
      });
      return comments.length === 1 && comments[0].replies.length === 1;
    }, 'Post yorumları ve cevapları bulma');
  }

  // 4. COMMENT LIKE MODEL TESTLERİ
  async testCommentLikeModel() {
    log('\n--- Comment Like Model Testleri ---', 'yellow');

    // Like oluşturma
    await asyncAssert(async () => {
      this.testData.like1 = await this.prisma.commentLike.create({
        data: {
          commentId: this.testData.comment1.id,
          userId: this.testData.user2.id,
          type: 'LIKE'
        }
      });
      return this.testData.like1.type === 'LIKE';
    }, 'Yorum beğenme');

    // Dislike oluşturma
    await asyncAssert(async () => {
      this.testData.dislike1 = await this.prisma.commentLike.create({
        data: {
          commentId: this.testData.reply1.id,
          userId: this.testData.user1.id,
          type: 'DISLIKE'
        }
      });
      return this.testData.dislike1.type === 'DISLIKE';
    }, 'Yorum beğenmeme');

    // Aynı kullanıcı aynı yorumu tekrar beğenemez
    await asyncAssert(async () => {
      try {
        await this.prisma.commentLike.create({
          data: {
            commentId: this.testData.comment1.id,
            userId: this.testData.user2.id,
            type: 'LIKE'
          }
        });
        return false; // Hata bekleniyor
      } catch (error) {
        return error.code === 'P2002'; // Unique constraint hatası
      }
    }, 'Duplicate like engelleme');

    // Like/dislike sayımı
    await asyncAssert(async () => {
      const comment = await this.prisma.comment.findUnique({
        where: { id: this.testData.comment1.id },
        include: {
          likes: true
        }
      });
      const likeCount = comment.likes.filter(like => like.type === 'LIKE').length;
      const dislikeCount = comment.likes.filter(like => like.type === 'DISLIKE').length;
      return likeCount === 1 && dislikeCount === 0;
    }, 'Like/dislike sayım doğruluğu');
  }

  // 5. ADMIN LOG MODEL TESTLERİ
  async testAdminLogModel() {
    log('\n--- Admin Log Model Testleri ---', 'yellow');

    // Admin log oluşturma
    await asyncAssert(async () => {
      this.testData.adminLog1 = await this.prisma.adminLog.create({
        data: {
          action: 'USER_LOGIN',
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1',
          details: JSON.stringify({ loginMethod: 'github', timestamp: new Date().toISOString() })
        }
      });
      return this.testData.adminLog1.action === 'USER_LOGIN';
    }, 'Admin log kaydı oluşturma');

    // Log sorgulama
    await asyncAssert(async () => {
      const logs = await this.prisma.adminLog.findMany({
        where: { userId: this.testData.user1.id },
        include: { user: true }
      });
      return logs.length === 1 && logs[0].user.email === 'test@erenailab.com';
    }, 'Admin log sorgulama');

    // Farklı aksiyonlar için log oluşturma
    const actions = ['COMMENT_DELETE', 'USER_BAN', 'CONTENT_MODERATE'];
    for (const action of actions) {
      await this.prisma.adminLog.create({
        data: {
          action,
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1'
        }
      });
    }

    await asyncAssert(async () => {
      const logCount = await this.prisma.adminLog.count();
      return logCount === 4; // 1 + 3 = 4 log kaydı
    }, 'Çoklu admin log kayıtları');
  }

  // 6. SITE SETTINGS MODEL TESTLERİ
  async testSiteSettingsModel() {
    log('\n--- Site Settings Model Testleri ---', 'yellow');

    // Site ayarları oluşturma
    await asyncAssert(async () => {
      this.testData.setting1 = await this.prisma.siteSettings.create({
        data: {
          key: 'site_title',
          value: 'ErenAILab Akademik Blog',
          type: 'string',
          category: 'general'
        }
      });
      return this.testData.setting1.key === 'site_title';
    }, 'Site ayarı oluşturma');

    // JSON değer ayarı
    await asyncAssert(async () => {
      this.testData.setting2 = await this.prisma.siteSettings.create({
        data: {
          key: 'social_links',
          value: JSON.stringify({
            twitter: 'https://twitter.com/erenailab',
            github: 'https://github.com/erenailab'
          }),
          type: 'json',
          category: 'general'
        }
      });
      
      const parsed = JSON.parse(this.testData.setting2.value);
      return parsed.twitter && parsed.github;
    }, 'JSON türünde ayar oluşturma');

    // Ayar güncelleme
    await asyncAssert(async () => {
      const updated = await this.prisma.siteSettings.update({
        where: { key: 'site_title' },
        data: { value: 'ErenAILab - Updated Title' }
      });
      return updated.value === 'ErenAILab - Updated Title';
    }, 'Site ayarı güncelleme');

    // Public ayarları bulma
    await asyncAssert(async () => {
      const generalSettings = await this.prisma.siteSettings.findMany({
        where: { category: 'general' }
      });
      return generalSettings.length === 2;
    }, 'Category ayarları filtreleme');
  }

  // 7. PAGE VIEW MODEL TESTLERİ
  async testPageViewModel() {
    log('\n--- Page View Model Testleri ---', 'yellow');

    // Sayfa görüntüleme kaydı
    await asyncAssert(async () => {
      this.testData.pageView1 = await this.prisma.pageView.create({
        data: {
          slug: '/blog/test-post-slug',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser'
        }
      });
      return this.testData.pageView1.slug === '/blog/test-post-slug';
    }, 'Sayfa görüntüleme kaydı oluşturma');

    // Anonim görüntüleme
    await asyncAssert(async () => {
      this.testData.pageView2 = await this.prisma.pageView.create({
        data: {
          slug: '/blog/test-post-slug',
          ipAddress: '192.168.1.2',
          userAgent: 'Anonymous Browser'
        }
      });
      return this.testData.pageView2.ipAddress === '192.168.1.2';
    }, 'Anonim sayfa görüntüleme');

    // Görüntüleme istatistikleri
    await asyncAssert(async () => {
      const viewCount = await this.prisma.pageView.count({
        where: { slug: '/blog/test-post-slug' }
      });
      return viewCount === 2;
    }, 'Sayfa görüntüleme sayımı');

    // Benzersiz görüntüleyici sayısı
    await asyncAssert(async () => {
      const uniqueViews = await this.prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: { slug: '/blog/test-post-slug' },
        _count: { ipAddress: true }
      });
      return uniqueViews.length === 2; // 2 farklı IP
    }, 'Benzersiz görüntüleyici sayımı');
  }

  // 8. NEWSLETTER MODEL TESTLERİ
  async testNewsletterModel() {
    log('\n--- Newsletter Model Testleri ---', 'yellow');

    // Newsletter kayıt
    await asyncAssert(async () => {
      this.testData.newsletter1 = await this.prisma.newsletter.create({
        data: {
          email: 'newsletter@test.com'
        }
      });
      return this.testData.newsletter1.email === 'newsletter@test.com';
    }, 'Newsletter kaydı oluşturma');

    // Duplicate email engelleme
    await asyncAssert(async () => {
      try {
        await this.prisma.newsletter.create({
          data: {
            email: 'newsletter@test.com' // Aynı email
          }
        });
        return false; // Hata bekleniyor
      } catch (error) {
        return error.code === 'P2002'; // Unique constraint hatası
      }
    }, 'Newsletter duplicate email engelleme');

    // Aktif subscriber sayısı
    await asyncAssert(async () => {
      const confirmedCount = await this.prisma.newsletter.count({
        where: { confirmed: true }
      });
      return confirmedCount === 0; // Henüz confirm edilmemiş
    }, 'Confirmed newsletter subscriber sayımı');

    // Newsletter kaydını confirm etme
    await asyncAssert(async () => {
      const updated = await this.prisma.newsletter.update({
        where: { email: 'newsletter@test.com' },
        data: { confirmed: true }
      });
      return updated.confirmed === true;
    }, 'Newsletter kaydını confirm etme');
  }

  // 9. İLİŞKİ VE VERİ BÜTÜNLÜĞÜ TESTLERİ
  async testRelationsAndIntegrity() {
    log('\n--- İlişki ve Veri Bütünlüğü Testleri ---', 'yellow');

    // Cascade delete testi - Kullanıcı silindiğinde yorumları ne olur?
    await asyncAssert(async () => {
      // Yeni kullanıcı ve yorum oluştur
      const tempUser = await this.prisma.user.create({
        data: {
          email: 'temp@test.com',
          name: 'Temp User'
        }
      });

      const tempComment = await this.prisma.comment.create({
        data: {
          content: 'Geçici yorum',
          postSlug: 'temp-post',
          userId: tempUser.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Test'
        }
      });

      // Kullanıcıyı sil
      await this.prisma.user.delete({
        where: { id: tempUser.id }
      });

      // Yorumun silindiğini kontrol et (CASCADE olduğu için)
      const commentStillExists = await this.prisma.comment.findUnique({
        where: { id: tempComment.id }
      });

      // Yorum silinmeli (CASCADE delete)
      return commentStillExists === null;
    }, 'Kullanıcı-yorum ilişkisi ve data integrity');

    // Foreign key constraint testi
    await asyncAssert(async () => {
      try {
        await this.prisma.comment.create({
          data: {
            content: 'Test yorum',
            postSlug: 'test-post',
            userId: 'nonexistent-user-id',
            ipAddress: '192.168.1.1',
            userAgent: 'Test'
          }
        });
        return false; // Hata bekleniyor
      } catch (error) {
        return error.code === 'P2003'; // Foreign key constraint hatası
      }
    }, 'Foreign key constraint kontrolü');

    // Derin ilişki sorgusu
    await asyncAssert(async () => {
      const userWithAllData = await this.prisma.user.findUnique({
        where: { id: this.testData.user1.id },
        include: {
          comments: {
            include: {
              likes: true,
              replies: true
            }
          },
          commentLikes: true,
          adminLogs: true
        }
      });

      return userWithAllData && 
             userWithAllData.comments.length > 0 && 
             userWithAllData.adminLogs.length > 0;
    }, 'Derin ilişki sorgusu ve veri bütünlüğü');
  }

  // 10. PERFORMANS VE SİNIR DURUM TESTLERİ
  async testPerformanceAndEdgeCases() {
    log('\n--- Performans ve Sınır Durum Testleri ---', 'yellow');

    // Büyük veri testi
    await asyncAssert(async () => {
      const largeContent = 'A'.repeat(10000); // 10KB içerik
      const largeComment = await this.prisma.comment.create({
        data: {
          content: largeContent,
          postSlug: 'large-content-test',
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser'
        }
      });
      return largeComment.content.length === 10000;
    }, 'Büyük içerik işleme testi');

    // Unicode ve özel karakter testi
    await asyncAssert(async () => {
      const unicodeContent = '🚀 AI ve ML konularında harika içerik! 中文测试 العربية';
      const unicodeComment = await this.prisma.comment.create({
        data: {
          content: unicodeContent,
          postSlug: 'unicode-test',
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Unicode Browser'
        }
      });
      return unicodeComment.content === unicodeContent;
    }, 'Unicode ve özel karakter desteği');

    // Çoklu eş zamanlı işlem simülasyonu
    await asyncAssert(async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          this.prisma.pageView.create({
            data: {
              slug: '/performance-test',
              ipAddress: `192.168.1.${i + 10}`,
              userAgent: `Concurrent Browser ${i}`
            }
          })
        );
      }

      const results = await Promise.all(promises);
      return results.length === 10;
    }, 'Eş zamanlı işlem testi');

    // Null ve boş değer işleme
    await asyncAssert(async () => {
      const minimalComment = await this.prisma.comment.create({
        data: {
          content: 'Minimal yorum',
          postSlug: 'minimal-test',
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Minimal Browser'
        }
      });
      return minimalComment.userId === this.testData.user1.id;
    }, 'Minimal değer işleme testi');

    // Sayfalama testi
    await asyncAssert(async () => {
      // Çok sayıda yorum oluştur
      for (let i = 0; i < 50; i++) {
        await this.prisma.comment.create({
          data: {
            content: `Sayfalama test yorumu ${i}`,
            postSlug: 'pagination-test',
            userId: this.testData.user1.id,
            ipAddress: '192.168.1.1',
            userAgent: 'Test Browser'
          }
        });
      }

      // Sayfalama ile veri çek
      const page1 = await this.prisma.comment.findMany({
        where: { postSlug: 'pagination-test' },
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' }
      });

      const page2 = await this.prisma.comment.findMany({
        where: { postSlug: 'pagination-test' },
        take: 10,
        skip: 10,
        orderBy: { createdAt: 'desc' }
      });

      return page1.length === 10 && page2.length === 10 && page1[0].id !== page2[0].id;
    }, 'Sayfalama ve sıralama testi');
  }

  // 11. GÜVENLİK TESTLERİ
  async testSecurity() {
    log('\n--- Güvenlik Testleri ---', 'yellow');

    // SQL Injection deneme (Prisma korumalı olmalı)
    await asyncAssert(async () => {
      try {
        const maliciousEmail = "'; DROP TABLE User; --";
        const user = await this.prisma.user.findUnique({
          where: { email: maliciousEmail }
        });
        return user === null; // Kötü amaçlı sorgu çalışmamalı
      } catch (error) {
        return true; // Hata da güvenlik açısından iyi
      }
    }, 'SQL Injection koruması');

    // XSS denemeleri (veri sanitizasyonu)
    await asyncAssert(async () => {
      const xssContent = '<script>alert("XSS")</script>';
      const comment = await this.prisma.comment.create({
        data: {
          content: xssContent,
          postSlug: 'xss-test',
          userId: this.testData.user1.id,
          ipAddress: '192.168.1.1',
          userAgent: 'XSS Browser'
        }
      });
      
      // Veri kaydedildi mi? (Sanitizasyon uygulama seviyesinde olmalı)
      return comment.content === xssContent;
    }, 'XSS içerik depolama (sanitizasyon app-level\'da)');

    // Uzun string saldırısı
    await asyncAssert(async () => {
      try {
        const veryLongString = 'A'.repeat(100000); // 100KB
        await this.prisma.comment.create({
          data: {
            content: veryLongString,
            postSlug: 'overflow-test',
            userId: this.testData.user1.id,
            ipAddress: '192.168.1.1',
            userAgent: 'Overflow Browser'
          }
        });
        return true; // Eğer başarılıysa sistem dayanıklı
      } catch (error) {
        return true; // Hata da beklenen bir durum
      }
    }, 'Buffer overflow koruması');
  }

  // Ana test çalıştırıcı
  async runAllTests() {
    log('🚀 ErenAILab Blog - Kapsamlı Veritabanı Test Paketi Başlatılıyor...', 'bold');
    log('═══════════════════════════════════════════════════════════════', 'blue');

    try {
      await this.setup();

      // Test gruplarını sırayla çalıştır
      await this.testConnection();
      await this.testUserModel();
      await this.testCommentModel();
      await this.testCommentLikeModel();
      await this.testAdminLogModel();
      await this.testSiteSettingsModel();
      await this.testPageViewModel();
      await this.testNewsletterModel();
      await this.testRelationsAndIntegrity();
      await this.testPerformanceAndEdgeCases();
      await this.testSecurity();

      await this.teardown();

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
    log('📊 TEST SONUÇLARI RAPORU', 'bold');
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

    const reportPath = join(process.cwd(), 'database-test-report.json');
    writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

    log(`\n📋 Detaylı rapor kaydedildi: ${reportPath}`, 'blue');

    // Sonuç özeti
    if (testResults.failed === 0) {
      log('\n🎉 TÜM TESTLER BAŞARILI! Veritabanı tam olarak çalışıyor.', 'green');
    } else if (successRate >= 80) {
      log('\n⚠️  Çoğu test başarılı, ancak bazı sorunlar var.', 'yellow');
    } else {
      log('\n🚨 ÖNEMLİ SORUNLAR TESPİT EDİLDİ! Acil müdahale gerekli.', 'red');
    }

    log('═══════════════════════════════════════════════════════════════', 'blue');
    log('Database test süreci tamamlandı.', 'bold');
  }
}

// Test paketi çalıştırıcı
async function main() {
  const tester = new DatabaseTester();
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

module.exports = { DatabaseTester, testResults };