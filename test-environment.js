// Environment Configuration Testing Suite
const fs = require('fs')
const path = require('path')

class EnvironmentTestSuite {
  constructor() {
    this.testResults = []
    this.passed = 0
    this.failed = 0
  }

  log(test, status, message, details = null) {
    const result = { test, status, message, details, timestamp: new Date().toISOString() }
    this.testResults.push(result)
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${emoji} ${test}: ${message}`)
    
    if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`)
    
    if (status === 'PASS') this.passed++
    if (status === 'FAIL') this.failed++
  }

  testEnvironmentFiles() {
    try {
      const projectRoot = process.cwd()
      const envExample = path.join(projectRoot, '.env.example')
      const envLocal = path.join(projectRoot, '.env.local')

      const files = {
        '.env.example': fs.existsSync(envExample),
        '.env.local': fs.existsSync(envLocal)
      }

      if (files['.env.example'] && files['.env.local']) {
        this.log('ENV_FILES', 'PASS', 'Environment files exist', files)
        return true
      } else {
        this.log('ENV_FILES', 'FAIL', 'Missing environment files', files)
        return false
      }
    } catch (error) {
      this.log('ENV_FILES', 'FAIL', 'Environment file check failed', error.message)
      return false
    }
  }

  testRequiredEnvironmentVariables() {
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET'
    ]

    const results = {}
    let allPresent = true

    for (const varName of requiredVars) {
      const value = process.env[varName]
      results[varName] = {
        present: !!value,
        hasValue: !!(value && value.trim())
      }
      
      if (!results[varName].present || !results[varName].hasValue) {
        allPresent = false
      }
    }

    if (allPresent) {
      this.log('REQUIRED_ENV_VARS', 'PASS', 'All required environment variables present', results)
    } else {
      this.log('REQUIRED_ENV_VARS', 'FAIL', 'Missing required environment variables', results)
    }

    return allPresent
  }

  testDatabaseUrlFormat() {
    try {
      const dbUrl = process.env.DATABASE_URL
      
      if (!dbUrl) {
        this.log('DATABASE_URL_FORMAT', 'FAIL', 'DATABASE_URL not set')
        return false
      }

      // Test SQLite format for development
      const isSqlite = dbUrl.startsWith('file:')
      const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
      
      if (isSqlite || isPostgres) {
        this.log('DATABASE_URL_FORMAT', 'PASS', 'DATABASE_URL format valid', {
          url: dbUrl.substring(0, 20) + '...',
          type: isSqlite ? 'SQLite' : 'PostgreSQL'
        })
        return true
      } else {
        this.log('DATABASE_URL_FORMAT', 'FAIL', 'Invalid DATABASE_URL format', {
          url: dbUrl.substring(0, 20) + '...'
        })
        return false
      }
    } catch (error) {
      this.log('DATABASE_URL_FORMAT', 'FAIL', 'DATABASE_URL validation failed', error.message)
      return false
    }
  }

  testNextAuthConfiguration() {
    try {
      const nextAuthUrl = process.env.NEXTAUTH_URL
      const nextAuthSecret = process.env.NEXTAUTH_SECRET

      const results = {
        urlValid: false,
        secretValid: false
      }

      // Test NEXTAUTH_URL
      if (nextAuthUrl) {
        try {
          new URL(nextAuthUrl)
          results.urlValid = true
        } catch {
          results.urlValid = false
        }
      }

      // Test NEXTAUTH_SECRET
      if (nextAuthSecret && nextAuthSecret.length >= 32) {
        results.secretValid = true
      }

      if (results.urlValid && results.secretValid) {
        this.log('NEXTAUTH_CONFIG', 'PASS', 'NextAuth configuration valid', results)
        return true
      } else {
        this.log('NEXTAUTH_CONFIG', 'FAIL', 'NextAuth configuration invalid', results)
        return false
      }
    } catch (error) {
      this.log('NEXTAUTH_CONFIG', 'FAIL', 'NextAuth configuration test failed', error.message)
      return false
    }
  }

  testOptionalConfiguration() {
    const optionalVars = [
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'SITE_URL',
      'SITE_NAME'
    ]

    const results = {}
    for (const varName of optionalVars) {
      results[varName] = !!process.env[varName]
    }

    const configuredCount = Object.values(results).filter(Boolean).length
    
    this.log('OPTIONAL_CONFIG', 'INFO', `Optional configuration status`, {
      configured: configuredCount,
      total: optionalVars.length,
      details: results
    })

    return true
  }

  async testConfigImport() {
    try {
      // Set required environment variables for testing
      if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'file:./test.db'
      }
      if (!process.env.NEXTAUTH_URL) {
        process.env.NEXTAUTH_URL = 'http://localhost:3000'
      }
      if (!process.env.NEXTAUTH_SECRET) {
        process.env.NEXTAUTH_SECRET = 'test-secret-key-minimum-32-characters'
      }

      // Test if we can import the config without errors
      const { config } = require('./src/lib/config')
      
      const configTests = {
        isDevelopment: typeof config.isDevelopment === 'boolean',
        siteName: typeof config.site.name === 'string',
        rateLimit: typeof config.security.rateLimit === 'object',
        databaseUrl: typeof config.database.url === 'string'
      }

      const allConfigValid = Object.values(configTests).every(Boolean)

      if (allConfigValid) {
        this.log('CONFIG_IMPORT', 'PASS', 'Configuration import successful', configTests)
        return true
      } else {
        this.log('CONFIG_IMPORT', 'FAIL', 'Configuration validation failed', configTests)
        return false
      }
    } catch (error) {
      this.log('CONFIG_IMPORT', 'FAIL', 'Configuration import failed', error.message)
      return false
    }
  }

  async runAllTests() {
    console.log('🔧 Starting Environment Configuration Test Suite...\n')

    const tests = [
      () => this.testEnvironmentFiles(),
      () => this.testRequiredEnvironmentVariables(),
      () => this.testDatabaseUrlFormat(),
      () => this.testNextAuthConfiguration(),
      () => this.testOptionalConfiguration(),
      () => this.testConfigImport()
    ]

    for (const test of tests) {
      await test()
    }

    console.log('\n📊 Environment Test Results:')
    console.log(`✅ Passed: ${this.passed}`)
    console.log(`❌ Failed: ${this.failed}`)
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`)

    return {
      passed: this.passed,
      failed: this.failed,
      total: this.passed + this.failed,
      results: this.testResults
    }
  }
}

module.exports = { EnvironmentTestSuite }

if (require.main === module) {
  const testSuite = new EnvironmentTestSuite()
  testSuite.runAllTests()
    .then(results => {
      console.log('\n🎉 Environment testing completed!')
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('💥 Environment testing failed:', error)
      process.exit(1)
    })
}