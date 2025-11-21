import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || 'admin@field-pulse.io',
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'admin@field-pulse.io';
const FROM_NAME = process.env.FROM_NAME || 'FieldPulse Go';
const TEST_EMAIL = process.env.TEST_EMAIL || process.env.SMTP_USER;

async function testEmail() {
  console.log('📧 Testing Email Configuration');
  console.log('================================');
  console.log(`Host: ${EMAIL_CONFIG.host}`);
  console.log(`Port: ${EMAIL_CONFIG.port}`);
  console.log(`Secure (SSL): ${EMAIL_CONFIG.secure}`);
  console.log(`From: ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`To: ${TEST_EMAIL}`);
  console.log('================================\n');

  try {
    console.log('🔍 Step 1: Creating transporter...');
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    console.log('✅ Transporter created\n');

    console.log('🔍 Step 2: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('🔍 Step 3: Sending test email...');
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: TEST_EMAIL,
      subject: '✅ Test Email from Railway - FieldPulse Go',
      text: `This is a test email sent from Railway at ${new Date().toISOString()}\n\nIf you received this, your email configuration is working correctly!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">✅ Test Email Successful</h2>
            </div>
            <div class="content">
              <p><strong>Congratulations!</strong></p>
              <p>This test email was sent from Railway at:</p>
              <p><code>${new Date().toISOString()}</code></p>
              <p>Your email configuration is working correctly!</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                <strong>Configuration:</strong><br>
                Host: ${EMAIL_CONFIG.host}<br>
                Port: ${EMAIL_CONFIG.port}<br>
                Secure: ${EMAIL_CONFIG.secure}<br>
                From: ${FROM_NAME} &lt;${FROM_EMAIL}&gt;
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Test email sent successfully!\n');
    console.log('📬 Message ID:', info.messageId);
    console.log('📊 Response:', info.response);
    console.log('\n🎉 Email test completed successfully!');
    console.log(`📥 Check your inbox at: ${TEST_EMAIL}`);
    
  } catch (error) {
    console.error('\n❌ Email test failed!');
    console.error('Error details:', error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Check that SMTP_USER and SMTP_PASS are set correctly');
    console.error('2. Verify that the Gmail App Password is valid');
    console.error('3. Check if Railway allows outbound SMTP connections');
    console.error('4. Try using a different email service (Resend, SendGrid)');
    process.exit(1);
  }
}

testEmail();

