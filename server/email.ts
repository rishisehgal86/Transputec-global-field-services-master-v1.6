import { ENV } from './_core/env';

/**
 * Email notification utility for sending alerts to admin and clients
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

/**
 * Send ticket confirmation to client
 */
export async function sendClientConfirmation(ticketData: {
  clientName: string;
  clientEmail: string;
  siteName: string;
  siteAddress: string;
  scheduledDateTime?: Date;
  incidentDetails: string;
  hoursRequired: string;
  ticketId: number;
  trackingToken: string;
}): Promise<boolean> {
  const subject = `Service Request Confirmation - ${ticketData.siteName}`;
  
  const trackingUrl = `/track/${ticketData.trackingToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .highlight { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">✅ Service Request Received</h2>
        </div>
        <div class="content">
          <p>Dear ${ticketData.clientName},</p>
          <p>Thank you for submitting your service request. We have received your request and it is currently being reviewed by our team.</p>
          
          <div class="highlight">
            <strong>📍 Track Your Request</strong><br>
            You can track the status of your service request and view engineer location in real-time using the link below.
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
          
          <a href="${trackingUrl}" class="button">
            Track Your Request →
          </a>
          
          <div class="footer">
            <p><strong>What happens next?</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Our team will review your request</li>
              <li>Once approved, an engineer will be assigned</li>
              <li>You'll be able to track the engineer's location in real-time</li>
              <li>After completion, you'll receive a Site Visit Report</li>
            </ol>
            <p>This is an automated confirmation from Transputec Field Engineer Dispatch System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Service Request Confirmation

Dear ${ticketData.clientName},

Thank you for submitting your service request. We have received your request and it is currently being reviewed by our team.

Site Name: ${ticketData.siteName}
Site Address: ${ticketData.siteAddress}
${ticketData.scheduledDateTime ? `Scheduled: ${ticketData.scheduledDateTime.toLocaleString()}` : ''}
Estimated Hours: ${ticketData.hoursRequired}
Issue: ${ticketData.incidentDetails}

Track your request: ${trackingUrl}

What happens next?
1. Our team will review your request
2. Once approved, an engineer will be assigned
3. You'll be able to track the engineer's location in real-time
4. After completion, you'll receive a Site Visit Report

This is an automated confirmation from Transputec Field Engineer Dispatch System.
  `.trim();
  
  return await sendEmail({
    to: ticketData.clientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send Site Visit Report to specified email
 */
export async function sendSiteVisitReport(reportData: {
  recipientEmail: string;
  clientName: string;
  siteName: string;
  visitDate: Date;
  engineerName: string;
  onsiteContact?: string;
  timeOnsite?: string;
  timeLeftSite?: string;
  issueFault?: string;
  actionsPerformed?: string;
  issueResolved: boolean;
  contactAgreed: boolean;
  clientSignatory?: string;
}): Promise<boolean> {
  const subject = `Site Visit Report - ${reportData.siteName} - ${reportData.visitDate.toLocaleDateString()}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
        .content { background-color: white; padding: 30px; border: 1px solid #e5e7eb; }
        .section { margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #3b82f6; }
        .section-title { font-weight: bold; color: #1f2937; font-size: 16px; margin-bottom: 10px; }
        .detail-row { margin: 8px 0; }
        .label { font-weight: 600; color: #4b5563; display: inline-block; min-width: 150px; }
        .value { color: #1f2937; }
        .status-yes { color: #10b981; font-weight: bold; }
        .status-no { color: #ef4444; font-weight: bold; }
        .signature { margin-top: 20px; padding: 15px; background-color: #fef3c7; border: 2px dashed #f59e0b; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">SITE VISIT REPORT</h1>
          <p style="margin: 10px 0 0 0;">Transputec Field Services</p>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">Visit Information</div>
            <div class="detail-row">
              <span class="label">Date of Visit:</span>
              <span class="value">${reportData.visitDate.toLocaleDateString('en-GB', { dateStyle: 'full' })}</span>
            </div>
            <div class="detail-row">
              <span class="label">Engineer Name:</span>
              <span class="value">${reportData.engineerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Site Name:</span>
              <span class="value">${reportData.siteName}</span>
            </div>
            ${reportData.onsiteContact ? `
            <div class="detail-row">
              <span class="label">Onsite Contact:</span>
              <span class="value">${reportData.onsiteContact}</span>
            </div>
            ` : ''}
            ${reportData.timeOnsite ? `
            <div class="detail-row">
              <span class="label">Time Arrived Onsite:</span>
              <span class="value">${reportData.timeOnsite}</span>
            </div>
            ` : ''}
            ${reportData.timeLeftSite ? `
            <div class="detail-row">
              <span class="label">Time Left Site:</span>
              <span class="value">${reportData.timeLeftSite}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Work Performed</div>
            ${reportData.issueFault ? `
            <div class="detail-row">
              <span class="label">Issue/Fault:</span>
              <div class="value" style="margin-top: 5px;">${reportData.issueFault}</div>
            </div>
            ` : ''}
            ${reportData.actionsPerformed ? `
            <div class="detail-row" style="margin-top: 15px;">
              <span class="label">Actions Performed:</span>
              <div class="value" style="margin-top: 5px;">${reportData.actionsPerformed}</div>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Resolution Status</div>
            <div class="detail-row">
              <span class="label">Was the issue resolved?</span>
              <span class="${reportData.issueResolved ? 'status-yes' : 'status-no'}">
                ${reportData.issueResolved ? '✓ YES' : '✗ NO'}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Did onsite contact agree?</span>
              <span class="${reportData.contactAgreed ? 'status-yes' : 'status-no'}">
                ${reportData.contactAgreed ? '✓ YES' : '✗ NO'}
              </span>
            </div>
          </div>

          ${reportData.clientSignatory ? `
          <div class="signature">
            <div class="section-title">Client Sign-off</div>
            <div class="detail-row">
              <span class="label">Signed by:</span>
              <span class="value">${reportData.clientSignatory}</span>
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
              Digital signature captured on-site
            </p>
          </div>
          ` : ''}

          <div class="footer">
            <p><strong>Transputec</strong> - Global IT Service Provider</p>
            <p>This is an automated report from the Field Engineer Dispatch System.</p>
            <p>Generated on ${new Date().toLocaleString('en-GB')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
SITE VISIT REPORT
Transputec Field Services

Visit Information:
- Date of Visit: ${reportData.visitDate.toLocaleDateString()}
- Engineer Name: ${reportData.engineerName}
- Site Name: ${reportData.siteName}
${reportData.onsiteContact ? `- Onsite Contact: ${reportData.onsiteContact}` : ''}
${reportData.timeOnsite ? `- Time Arrived: ${reportData.timeOnsite}` : ''}
${reportData.timeLeftSite ? `- Time Left: ${reportData.timeLeftSite}` : ''}

Work Performed:
${reportData.issueFault ? `Issue/Fault: ${reportData.issueFault}` : ''}
${reportData.actionsPerformed ? `Actions Performed: ${reportData.actionsPerformed}` : ''}

Resolution Status:
- Was the issue resolved? ${reportData.issueResolved ? 'YES' : 'NO'}
- Did onsite contact agree? ${reportData.contactAgreed ? 'YES' : 'NO'}

${reportData.clientSignatory ? `Client Sign-off: ${reportData.clientSignatory}` : ''}

---
Transputec - Global IT Service Provider
Generated on ${new Date().toLocaleString()}
  `.trim();
  
  return await sendEmail({
    to: reportData.recipientEmail,
    subject,
    html,
    text,
  });
}

