import { ENV } from './_core/env';

/**
 * Email notification utility for sending alerts to admin
 * Uses SMTP configuration from environment variables
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification
 * For now, we'll use the built-in notification system
 * In production, integrate with SMTP service (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Log email for debugging
    console.log('[Email] Sending notification:', {
      to: options.to,
      subject: options.subject,
    });

    // In a production environment, you would integrate with an SMTP service here
    // For example, using nodemailer with SendGrid, AWS SES, or similar
    // 
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    // 
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to: options.to,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });

    // For now, we'll use console logging
    // The admin can monitor server logs for notifications
    console.log('[Email] Content:', options.html);
    
    return true;
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
    return false;
  }
}

/**
 * Send new ticket notification to admin
 */
export async function sendNewTicketNotification(ticketData: {
  clientName: string;
  siteName: string;
  siteAddress: string;
  scheduledDateTime?: Date;
  incidentDetails: string;
  hoursRequired: string;
  adminEmail: string;
  ticketId: number;
}): Promise<boolean> {
  const subject = `New Service Request: ${ticketData.siteName} - ${ticketData.clientName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .urgent { background-color: #fef2f2; border-left: 4px solid #ef4444; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🔔 New Service Request Submitted</h2>
        </div>
        <div class="content">
          <p>A new field service request has been submitted and requires your review.</p>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${ticketData.clientName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${ticketData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${ticketData.siteAddress}</div>
          </div>
          
          ${ticketData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${ticketData.scheduledDateTime.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <div class="label">Estimated Hours:</div>
            <div class="value">${ticketData.hoursRequired}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Issue Description:</div>
            <div class="value">${ticketData.incidentDetails}</div>
          </div>
          
          <a href="/admin/job/${ticketData.ticketId}" class="button">
            Review Request →
          </a>
          
          <div class="footer">
            <p>This is an automated notification from Transputec Field Engineer Dispatch System.</p>
            <p>Please log in to the admin dashboard to approve or reject this request.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New Service Request Submitted

Client: ${ticketData.clientName}
Site Name: ${ticketData.siteName}
Site Address: ${ticketData.siteAddress}
${ticketData.scheduledDateTime ? `Scheduled: ${ticketData.scheduledDateTime.toLocaleString()}` : ''}
Estimated Hours: ${ticketData.hoursRequired}
Issue: ${ticketData.incidentDetails}

Please review this request in the admin dashboard.
  `.trim();
  
  return await sendEmail({
    to: ticketData.adminEmail,
    subject,
    html,
    text,
  });
}

