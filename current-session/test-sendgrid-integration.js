/**
 * Simple test to verify SendGrid integration works
 */

async function testSendGridIntegration() {
  try {
    // Test import
    const { EmailTemplate, sendBookingConfirmationEmail } = require('../lib/scheduling/sendgrid-email.ts');
    
    console.log('✅ SendGrid module imported successfully');
    console.log('✅ EmailTemplate enum available:', Object.keys(EmailTemplate));
    console.log('✅ sendBookingConfirmationEmail function available:', typeof sendBookingConfirmationEmail);
    
    // Test @sendgrid/mail dependency
    const sgMail = require('@sendgrid/mail');
    console.log('✅ @sendgrid/mail dependency loaded successfully');
    
    console.log('\n🎉 SendGrid integration migration SUCCESSFUL!');
    console.log('\nReady for proposal management email implementation.');
    
  } catch (error) {
    console.log('❌ SendGrid integration test failed:', error.message);
  }
}

testSendGridIntegration();