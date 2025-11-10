import nodemailer from 'nodemailer';

// Gmail SMTP Configuration (same as in email.ts)
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'rishi@karrdservicesuae.com',
    pass: 'lmiidxwmwamnzikf', // Gmail App Password
  },
};

const FROM_EMAIL = 'rishi@karrdservicesuae.com';
const FROM_NAME = 'DespatchApp Test';

async function testEmail() {
  console.log('🔍 Testing email configuration...\n');
  
  // Check environment variable
  console.log('Environment Check:');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ NOT SET');
  console.log('');
  
  // Test SMTP connection
  console.log('Testing SMTP connection...');
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(error);
    console.log('\nPossible issues:');
    console.log('1. Gmail app password may be invalid or expired');
    console.log('2. Gmail account may have 2FA disabled');
    console.log('3. Network/firewall blocking SMTP port 587');
    return;
  }
  
  // Send test email
  const testRecipient = process.env.ADMIN_EMAIL || 'test@example.com';
  console.log(`Sending test email to: ${testRecipient}...`);
  
  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: testRecipient,
      subject: 'Test Email - Transputec Dispatch System',
      text: 'This is a test email from the Transputec Field Engineer Dispatch system.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">✅ Email System Test</h2>
          <p>This is a test email from the Transputec Field Engineer Dispatch system.</p>
          <p>If you received this email, the email notification system is working correctly!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent from: ${FROM_EMAIL}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n📧 Check your inbox:', testRecipient);
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error);
  }
}

testEmail().catch(console.error);

