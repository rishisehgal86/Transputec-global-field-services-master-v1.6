import { ENV } from './_core/env';

interface PasswordResetEmailParams {
  email: string;
  name: string;
  resetToken: string;
  baseUrl: string;
}

interface WelcomeEmailParams {
  email: string;
  name: string;
  organizationName: string;
  baseUrl: string;
}

/**
 * Send password reset email with reset link
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void> {
  const { email, name, resetToken, baseUrl } = params;
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your FieldPulse Go account.</p>
      <p>Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">${resetLink}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    </div>
    <div class="footer">
      <p>© 2025 FieldPulse Go - On-Demand Field Services Platform</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch(`${ENV.builtInForgeApiUrl}/notification/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.builtInForgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Password Reset Request - FieldPulse Go',
        html: emailContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`);
    }

    console.log('[AuthEmail] Password reset email sent to:', email);
  } catch (error) {
    console.error('[AuthEmail] Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const { email, name, organizationName, baseUrl } = params;
  const loginLink = `${baseUrl}/login`;

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #f97316; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to FieldPulse Go!</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>
      <p>Welcome to FieldPulse Go! Your account for <strong>${organizationName}</strong> has been successfully created.</p>
      
      <p style="text-align: center;">
        <a href="${loginLink}" class="button">Login to Dashboard</a>
      </p>

      <h3>What you can do with FieldPulse Go:</h3>
      
      <div class="feature">
        <strong>📍 Live Dispatch Control</strong><br>
        Assign engineers instantly and track their location in real-time with GPS precision during travel and on-site work.
      </div>
      
      <div class="feature">
        <strong>⏱️ Geo Presence Verification</strong><br>
        Automatic tracking of travel time, arrival timestamps, and on-site duration for accurate billing and SLA compliance.
      </div>
      
      <div class="feature">
        <strong>✅ Instant Job Acceptance</strong><br>
        Engineers receive job details via secure link and can accept or decline assignments instantly from any device.
      </div>
      
      <div class="feature">
        <strong>👁️ Client Visibility</strong><br>
        Clients get real-time updates and can track engineer progress via shareable tracking links with live ETA calculations.
      </div>

      <p>Get started by logging into your admin dashboard and creating your first job request!</p>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>© 2025 FieldPulse Go - Instant Coverage. Always in Sync.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch(`${ENV.builtInForgeApiUrl}/notification/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.builtInForgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `Welcome to FieldPulse Go - ${organizationName}`,
        html: emailContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`);
    }

    console.log('[AuthEmail] Welcome email sent to:', email);
  } catch (error) {
    console.error('[AuthEmail] Failed to send welcome email:', error);
    // Don't throw - welcome email failure shouldn't block signup
    console.warn('[AuthEmail] Continuing despite email failure');
  }
}

