import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'admin@field-pulse.io',
    pass: 'mtcglnmbucshoyev',
  },
};

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('SMTP Host:', EMAIL_CONFIG.host);
  console.log('SMTP Port:', EMAIL_CONFIG.port);
  console.log('Auth User:', EMAIL_CONFIG.auth.user);
  
  try {
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    // Verify connection
    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully');
    
    // Send test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: '"FieldPulse Go" <admin@field-pulse.io>',
      to: 'admin@field-pulse.io',
      subject: 'Test Email - ' + new Date().toISOString(),
      text: 'This is a test email from FieldPulse Go dispatch system.',
      html: '<p>This is a <strong>test email</strong> from FieldPulse Go dispatch system.</p>',
    });
    
    console.log('✓ Email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('✗ Email test failed:');
    console.error(error);
  }
}

testEmail();
