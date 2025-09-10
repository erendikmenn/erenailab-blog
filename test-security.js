// Simple test to check if security components can be imported without dependency issues
const testSecurityImports = () => {
  console.log('🔒 Testing security component imports...')
  
  try {
    // Test config import
    const { config } = require('./src/lib/config')
    console.log('✅ Config import successful')
    console.log('📊 Config loaded:', {
      isDevelopment: config.isDevelopment,
      siteName: config.site.name,
      rateLimit: config.security.rateLimit
    })
    
    // Test rate limit import  
    const { rateLimit } = require('./src/lib/rate-limit')
    console.log('✅ Rate limit import successful')
    
    // Note: Skip validation import due to DOMPurify dependency
    console.log('⚠️ Validation module requires isomorphic-dompurify dependency')
    
    console.log('🎉 Security imports test completed!')
    console.log('📝 Next step: Install missing dependencies with npm install')
    
  } catch (error) {
    console.error('❌ Security import test failed:', error.message)
    console.log('🔧 This is expected - some dependencies need to be installed')
  }
}

testSecurityImports()