import { ENV } from './_core/env';
import nodemailer from 'nodemailer';

/**
 * Email notification utility for sending alerts to admin and clients
 * Uses Gmail SMTP with nodemailer
 */

// Get base URL for email links (works in both dev and production)
const getBaseUrl = () => {
  // In production, use the public URL from environment or default Manus domain
  if (process.env.NODE_ENV === 'production') {
    return process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  }
  // In development, use localhost
  return 'http://localhost:3000';
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

// SMTP Configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // Use TLS
  auth: {
    user: process.env.SMTP_USER || 'admin@field-pulse.io',
    pass: process.env.SMTP_PASS || 'mtcglnmbucshoyev', // Gmail App Password
  },
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'admin@field-pulse.io';
const FROM_NAME = process.env.FROM_NAME || 'FieldPulse Go';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

/**
 * Send email notification via Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log(`[Email] 📤 Attempting to send email to: ${options.to}`);
  console.log(`[Email] 📧 Subject: ${options.subject}`);
  
  try {
    const transport = getTransporter();
    
    const info = await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log(`[Email] ✅ Successfully sent to ${options.to}`);
    console.log(`[Email] 📬 Message ID: ${info.messageId}`);
    console.log(`[Email] 📊 Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error('[Email] ❌ Failed to send email to:', options.to);
    console.error('[Email] ❌ Error details:', error);
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
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
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
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `Service Request Confirmation - ${ticketData.siteName}`;
  
  // Use provided baseUrl or construct from environment
  const base = ticketData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${ticketData.trackingToken}`;
  
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
            <p>This is an automated confirmation from FieldPulse Go Dispatch System.</p>
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

This is an automated confirmation from FieldPulse Go Dispatch System.
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
          <p style="margin: 10px 0 0 0;">FieldPulse Go Field Services</p>
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
FieldPulse Go Field Services

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



/**
 * Send Site Visit Report via email
 */
export async function sendSVREmail(data: {
  recipientEmail: string;
  job: any;
  svr: any;
}): Promise<boolean> {
  const subject = `Site Visit Report - ${data.job.siteName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin: 20px 0; padding: 15px; background-color: white; border-radius: 5px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .detail-row { margin: 8px 0; display: flex; }
        .label { font-weight: bold; color: #4b5563; min-width: 180px; }
        .value { color: #1f2937; flex: 1; }
        .signature { margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px; }
        .signature img { max-width: 300px; border: 1px solid #d1d5db; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Site Visit Report</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">FieldPulse Go Field Services</p>
        </div>
        <div class="content">
          
          <div class="section">
            <div class="section-title">Visit Information</div>
            <div class="detail-row">
              <div class="label">Visit Date:</div>
              <div class="value">${new Date(data.svr.visitDate).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</div>
            </div>
            <div class="detail-row">
              <div class="label">Engineer:</div>
              <div class="value">${data.svr.engineerName}</div>
            </div>
            <div class="detail-row">
              <div class="label">Site Name:</div>
              <div class="value">${data.job.siteName}</div>
            </div>
            <div class="detail-row">
              <div class="label">Site Address:</div>
              <div class="value">${data.job.siteAddress || 'N/A'}</div>
            </div>
            ${data.svr.ticketNumbers ? `
            <div class="detail-row">
              <div class="label">Ticket Numbers:</div>
              <div class="value">${data.svr.ticketNumbers}</div>
            </div>
            ` : ''}
            ${data.svr.onsiteContact ? `
            <div class="detail-row">
              <div class="label">Onsite Contact:</div>
              <div class="value">${data.svr.onsiteContact}</div>
            </div>
            ` : ''}
            <div class="detail-row">
              <div class="label">Time Arrived:</div>
              <div class="value">${data.svr.timeOnsite}</div>
            </div>
            ${data.svr.timeLeftSite ? `
            <div class="detail-row">
              <div class="label">Time Left Site:</div>
              <div class="value">${data.svr.timeLeftSite}</div>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Work Details</div>
            <div class="detail-row">
              <div class="label">Issue/Fault:</div>
              <div class="value">${data.svr.issueFault}</div>
            </div>
            <div class="detail-row">
              <div class="label">Actions Performed:</div>
              <div class="value">${data.svr.actionsPerformed}</div>
            </div>
            <div class="detail-row">
              <div class="label">Issue Resolved:</div>
              <div class="value">${data.svr.issueResolved ? '✅ Yes' : '❌ No'}</div>
            </div>
            <div class="detail-row">
              <div class="label">Contact Agreed:</div>
              <div class="value">${data.svr.contactAgreed ? '✅ Yes' : '❌ No'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Client Sign-off</div>
            <div class="detail-row">
              <div class="label">Signed By:</div>
              <div class="value">${data.svr.clientSignatory}</div>
            </div>
            <div class="detail-row">
              <div class="label">Signed At:</div>
              <div class="value">${new Date(data.svr.signedAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</div>
            </div>
            <div class="signature">
              <div style="font-weight: bold; margin-bottom: 10px;">Client Signature:</div>
              <img src="${data.svr.clientSignatureData}" alt="Client Signature" />
            </div>
          </div>

          <div class="footer">
            <p>This Site Visit Report was generated by FieldPulse Go Dispatch System.</p>
            <p>For any questions or concerns, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
SITE VISIT REPORT
FieldPulse Go Field Services

VISIT INFORMATION
Visit Date: ${new Date(data.svr.visitDate).toLocaleString()}
Engineer: ${data.svr.engineerName}
Site Name: ${data.job.siteName}
Site Address: ${data.job.siteAddress || 'N/A'}
${data.svr.ticketNumbers ? `Ticket Numbers: ${data.svr.ticketNumbers}` : ''}
${data.svr.onsiteContact ? `Onsite Contact: ${data.svr.onsiteContact}` : ''}
Time Arrived: ${data.svr.timeOnsite}
${data.svr.timeLeftSite ? `Time Left Site: ${data.svr.timeLeftSite}` : ''}

WORK DETAILS
Issue/Fault: ${data.svr.issueFault}
Actions Performed: ${data.svr.actionsPerformed}
Issue Resolved: ${data.svr.issueResolved ? 'Yes' : 'No'}
Contact Agreed: ${data.svr.contactAgreed ? 'Yes' : 'No'}

CLIENT SIGN-OFF
Signed By: ${data.svr.clientSignatory}
Signed At: ${new Date(data.svr.signedAt).toLocaleString()}

This Site Visit Report was generated by FieldPulse Go Dispatch System.
  `.trim();
  
  return await sendEmail({
    to: data.recipientEmail,
    subject,
    html,
    text,
  });
}



/**
 * Send job assignment notification to engineer
 */
export async function sendJobAssignmentNotification(engineerData: {
  engineerEmail: string;
  engineerName: string;
  siteName: string;
  siteAddress: string;
  scheduledDateTime?: Date;
  incidentDetails: string;
  jobToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `New Job Assignment: ${engineerData.siteName}`;
  
  const base = engineerData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const jobUrl = `${base}/engineer/${engineerData.jobToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .highlight { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🔧 New Job Assignment</h2>
        </div>
        <div class="content">
          <p>Dear ${engineerData.engineerName},</p>
          <p>You have been assigned a new field service job. Please review the details below and accept or decline the assignment.</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${engineerData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${engineerData.siteAddress}</div>
          </div>
          
          ${engineerData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${engineerData.scheduledDateTime.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <div class="label">Issue Description:</div>
            <div class="value">${engineerData.incidentDetails}</div>
          </div>
          
          <div class="highlight">
            <strong>⚡ Action Required</strong><br>
            Please click the button below to view the full job details and accept or decline this assignment.
          </div>
          
          <a href="${jobUrl}" class="button">
            View Job Details →
          </a>
          
          <div class="footer">
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
            <p>Please respond to this assignment as soon as possible.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New Job Assignment

Dear ${engineerData.engineerName},

You have been assigned a new field service job.

Site Name: ${engineerData.siteName}
Site Address: ${engineerData.siteAddress}
${engineerData.scheduledDateTime ? `Scheduled: ${engineerData.scheduledDateTime.toLocaleString()}` : ''}
Issue: ${engineerData.incidentDetails}

View job details and respond: ${jobUrl}

This is an automated notification from FieldPulse Go Dispatch System.
  `.trim();
  
  return await sendEmail({
    to: engineerData.engineerEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send status update notification to client
 */
export async function sendStatusUpdateNotification(clientEmail: string, statusData: {
  status: string;
  engineerName?: string;
  siteName: string;
  jobToken: string;
  baseUrl?: string;
  eta?: string;
}): Promise<boolean> {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    'accepted': {
      title: 'Job Accepted',
      message: 'Your service request has been accepted by our engineer.',
      color: '#10b981'
    },
    'en_route': {
      title: 'Engineer En Route',
      message: 'Our engineer is on the way to your location.',
      color: '#3b82f6'
    },
    'on_site': {
      title: 'Engineer On Site',
      message: 'Our engineer has arrived at your location and is working on the issue.',
      color: '#8b5cf6'
    },
    'completed': {
      title: 'Job Completed',
      message: 'The service visit has been completed. Please check the Site Visit Report for details.',
      color: '#10b981'
    }
  };
  
  const statusInfo = statusMessages[statusData.status] || {
    title: 'Status Update',
    message: 'Your service request status has been updated.',
    color: '#6b7280'
  };
  
  const subject = `${statusInfo.title}: ${statusData.siteName}`;
  const base = statusData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${statusData.jobToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${statusInfo.color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📍 ${statusInfo.title}</h2>
        </div>
        <div class="content">
          <p>${statusInfo.message}</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${statusData.siteName}</div>
          </div>
          
          ${statusData.engineerName ? `
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${statusData.engineerName}</div>
          </div>
          ` : ''}
          
          ${statusData.eta ? `
          <div class="detail-row">
            <div class="label">Estimated Arrival:</div>
            <div class="value">${statusData.eta}</div>
          </div>
          ` : ''}
          
          <a href="${trackingUrl}" class="button">
            Track Service Request →
          </a>
          
          <div class="footer">
            <p>You can track your service request in real-time using the link above.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
${statusInfo.title}: ${statusData.siteName}

${statusInfo.message}

Site Name: ${statusData.siteName}
${statusData.engineerName ? `Engineer: ${statusData.engineerName}` : ''}
${statusData.eta ? `Estimated Arrival: ${statusData.eta}` : ''}

Track your request: ${trackingUrl}

This is an automated notification from FieldPulse Go Dispatch System.
  `.trim();
  
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send new comment notification
 */
export async function sendCommentNotification(recipientEmail: string, commentData: {
  authorName: string;
  authorType: 'engineer' | 'client' | 'admin';
  commentText: string;
  siteName: string;
  jobToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const authorLabels = {
    engineer: '🔧 Engineer',
    client: '👤 Client',
    admin: '⚙️ Admin'
  };
  
  const subject = `New Comment on ${commentData.siteName}`;
  const base = commentData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${commentData.jobToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6366f1; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .comment-box { margin: 20px 0; padding: 15px; background-color: white; border-left: 4px solid #6366f1; border-radius: 3px; }
        .author { font-weight: bold; color: #4b5563; margin-bottom: 10px; }
        .comment-text { color: #1f2937; }
        .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">💬 New Comment</h2>
        </div>
        <div class="content">
          <p>A new comment has been posted on your service request: <strong>${commentData.siteName}</strong></p>
          
          <div class="comment-box">
            <div class="author">${authorLabels[commentData.authorType]} ${commentData.authorName}</div>
            <div class="comment-text">${commentData.commentText}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            View Full Conversation →
          </a>
          
          <div class="footer">
            <p>You can view all comments and reply using the link above.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
New Comment on ${commentData.siteName}

${authorLabels[commentData.authorType]} ${commentData.authorName} wrote:
"${commentData.commentText}"

View full conversation: ${trackingUrl}

This is an automated notification from FieldPulse Go Dispatch System.
  `.trim();
  
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send job completion notification with SVR to client and admin
 */
export async function sendJobCompletionNotification(recipientEmail: string, completionData: {
  engineerName?: string;
  siteName: string;
  jobToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `Job Completed: ${completionData.siteName}`;
  const base = completionData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${completionData.jobToken}`;
  
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
        .highlight { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">✅ Job Completed</h2>
        </div>
        <div class="content">
          <p>The field service job has been successfully completed.</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${completionData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${completionData.engineerName}</div>
          </div>
          
          <div class="highlight">
            <strong>📄 Site Visit Report Available</strong><br>
            A detailed Site Visit Report has been generated and is now available for your review.
          </div>
          
          <a href="${trackingUrl}" class="button">
            View Site Visit Report →
          </a>
          
          <div class="footer">
            <p>Thank you for using FieldPulse Go Field Services.</p>
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Job Completed: ${completionData.siteName}

The field service job has been successfully completed.

Site Name: ${completionData.siteName}
Engineer: ${completionData.engineerName}

A detailed Site Visit Report is now available for your review.

View report: ${trackingUrl}

Thank you for using FieldPulse Go Field Services.
  `.trim();
  
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  });
}




/**
 * Send job cancellation notification
 */
export async function sendCancellationNotification(data: {
  jobId: number;
  siteName: string;
  clientName: string;
  clientEmail?: string;
  engineerName?: string;
  engineerEmail?: string;
  cancellationReason: string;
  cancelledBy: string;
  trackingUrl: string;
  baseUrl: string;
}): Promise<boolean> {
  const {
    jobId,
    siteName,
    clientName,
    clientEmail,
    engineerName,
    engineerEmail,
    cancellationReason,
    cancelledBy,
    trackingUrl,
    baseUrl,
  } = data;

  const adminEmail = "rishi@karrdservicesuae.com";

  // Email template
  const emailTemplate = (recipientType: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .info-box { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Job Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientType},</p>
          
          <p>This is to inform you that the following service request has been <strong>cancelled</strong>:</p>
          
          <div class="info-box">
            <p><strong>Job ID:</strong> #${jobId}</p>
            <p><strong>Site:</strong> ${siteName}</p>
            <p><strong>Client:</strong> ${clientName}</p>
            ${engineerName ? `<p><strong>Engineer:</strong> ${engineerName}</p>` : ''}
          </div>

          <div class="info-box">
            <p><strong>Cancelled By:</strong> ${cancelledBy}</p>
            <p><strong>Reason:</strong> ${cancellationReason}</p>
            <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
          </div>

          ${recipientType === 'Client' ? `
            <p>We apologize for any inconvenience this may cause. If you have any questions or would like to reschedule, please contact us.</p>
            <a href="${trackingUrl}" class="button">View Job Details</a>
          ` : ''}

          ${recipientType === 'Engineer' ? `
            <p>You are no longer required to attend this service call. Please disregard any previous notifications for this job.</p>
          ` : ''}

          ${recipientType === 'Admin' ? `
            <p>The job has been cancelled and all parties have been notified.</p>
            <a href="${baseUrl}/admin/job/${jobId}" class="button">View Job Details</a>
          ` : ''}
        </div>
        <div class="footer">
          <p>© 2025 FieldPulse Go. Instant Coverage. Always in Sync..</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const results: boolean[] = [];

  // Send to admin
  try {
    console.log(`[Email] 📤 Attempting to send cancellation notification to admin: ${adminEmail}`);
    await sendEmail({
      to: adminEmail,
      subject: `Job Cancelled: ${siteName} - ${clientName}`,
      html: emailTemplate('Admin'),
    });
    console.log(`[Email] ✅ Successfully sent cancellation notification to admin: ${adminEmail}`);
    results.push(true);
  } catch (error) {
    console.error(`[Email] ✗ Failed to send cancellation notification to admin:`, error);
    results.push(false);
  }

  // Send to client if email provided
  if (clientEmail) {
    try {
      console.log(`[Email] 📤 Attempting to send cancellation notification to client: ${clientEmail}`);
      await sendEmail({
        to: clientEmail,
        subject: `Service Request Cancelled - ${siteName}`,
        html: emailTemplate('Client'),
      });
      console.log(`[Email] ✅ Successfully sent cancellation notification to client: ${clientEmail}`);
      results.push(true);
    } catch (error) {
      console.error(`[Email] ✗ Failed to send cancellation notification to client:`, error);
      results.push(false);
    }
  }

  // Send to engineer if email provided
  if (engineerEmail) {
    try {
      console.log(`[Email] 📤 Attempting to send cancellation notification to engineer: ${engineerEmail}`);
      await sendEmail({
        to: engineerEmail,
        subject: `Job Cancelled - ${siteName}`,
        html: emailTemplate('Engineer'),
      });
      console.log(`[Email] ✅ Successfully sent cancellation notification to engineer: ${engineerEmail}`);
      results.push(true);
    } catch (error) {
      console.error(`[Email] ✗ Failed to send cancellation notification to engineer:`, error);
      results.push(false);
    }
  }

  // Return true if at least one email was sent successfully
  return results.some(result => result);
}



/**
 * Send email notification to newly created user with their credentials
 */
export async function sendNewUserEmail(params: {
  recipientEmail: string;
  recipientName: string;
  password: string;
  organizationId: number;
  baseUrl?: string;
}): Promise<void> {
  const { recipientEmail, recipientName, password, organizationId, baseUrl: providedBaseUrl } = params;
  
  // Get organization details
  const { getOrganizationById } = await import('./organizations-db');
  const organization = await getOrganizationById(organizationId);
  const orgName = organization?.name || 'Your Organization';
  
  const baseUrl = providedBaseUrl || getBaseUrl();
  const loginUrl = `${baseUrl}/login`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${orgName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${orgName}!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          An administrator has created an account for you in the <strong>${orgName}</strong> dispatch system.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${recipientEmail}</p>
          <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">${password}</code></p>
        </div>
        
        <p style="font-size: 16px; margin: 20px 0;">
          <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Login Now
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          If you have any questions or need assistance, please contact your administrator.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          <em>This is an automated message. Please do not reply to this email.</em>
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to ${orgName}!

Hello ${recipientName},

An administrator has created an account for you in the ${orgName} dispatch system.

Your Login Credentials:
- Email: ${recipientEmail}
- Temporary Password: ${password}

⚠️ Important: Please change your password after your first login for security purposes.

Login here: ${loginUrl}

If you have any questions or need assistance, please contact your administrator.

This is an automated message. Please do not reply to this email.
  `;

  await sendEmail({
    to: recipientEmail,
    subject: `Welcome to ${orgName} - Your Account Has Been Created`,
    html: htmlContent,
    text: textContent,
  });
}



/**
 * Send engineer acceptance confirmation to admin
 */
export async function sendEngineerAcceptanceNotification(adminEmail: string, acceptanceData: {
  engineerName: string;
  engineerEmail: string;
  jobId: number;
  siteName: string;
  siteAddress: string;
  clientName: string;
  scheduledDateTime?: Date;
  acceptedAt: Date;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `✅ Job Accepted: ${acceptanceData.engineerName} - ${acceptanceData.siteName}`;
  
  const base = acceptanceData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const jobUrl = `${base}/admin/job/${acceptanceData.jobId}`;
  
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
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">✅ Engineer Accepted Job</h2>
        </div>
        <div class="content">
          <div class="success-box">
            <strong>${acceptanceData.engineerName}</strong> has accepted the job assignment.
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${acceptanceData.engineerName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer Email:</div>
            <div class="value">${acceptanceData.engineerEmail}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${acceptanceData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${acceptanceData.siteAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${acceptanceData.clientName}</div>
          </div>
          
          ${acceptanceData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${acceptanceData.scheduledDateTime.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <div class="label">Accepted At:</div>
            <div class="value">${acceptanceData.acceptedAt.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          
          <a href="${jobUrl}" class="button">
            View Job Details →
          </a>
          
          <div class="footer">
            <p>The engineer is now preparing for the job. The client has been notified of the acceptance.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Engineer Accepted Job

Engineer: ${acceptanceData.engineerName} (${acceptanceData.engineerEmail})
Site: ${acceptanceData.siteName}
Address: ${acceptanceData.siteAddress}
Client: ${acceptanceData.clientName}
${acceptanceData.scheduledDateTime ? `Scheduled: ${acceptanceData.scheduledDateTime.toLocaleString()}` : ''}
Accepted At: ${acceptanceData.acceptedAt.toLocaleString()}

View job details: ${jobUrl}
  `.trim();
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send engineer decline notification to admin
 */
export async function sendEngineerDeclineNotification(adminEmail: string, declineData: {
  engineerName: string;
  engineerEmail: string;
  jobId: number;
  siteName: string;
  siteAddress: string;
  clientName: string;
  scheduledDateTime?: Date;
  declinedAt: Date;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `❌ Job Declined: ${declineData.engineerName} - ${declineData.siteName}`;
  
  const base = declineData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const jobUrl = `${base}/admin/job/${declineData.jobId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .warning-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">❌ Engineer Declined Job</h2>
        </div>
        <div class="content">
          <div class="warning-box">
            <strong>Action Required:</strong> ${declineData.engineerName} has declined the job assignment. You need to reassign this job to another engineer.
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer Who Declined:</div>
            <div class="value">${declineData.engineerName} (${declineData.engineerEmail})</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${declineData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${declineData.siteAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${declineData.clientName}</div>
          </div>
          
          ${declineData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${declineData.scheduledDateTime.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <div class="label">Declined At:</div>
            <div class="value">${declineData.declinedAt.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          
          <a href="${jobUrl}" class="button">
            Reassign Job →
          </a>
          
          <div class="footer">
            <p><strong>Next Steps:</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Review the job details</li>
              <li>Select another available engineer</li>
              <li>Reassign the job using the "Reassign to Another Engineer" button</li>
            </ol>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Engineer Declined Job - Action Required

Engineer Who Declined: ${declineData.engineerName} (${declineData.engineerEmail})
Site: ${declineData.siteName}
Address: ${declineData.siteAddress}
Client: ${declineData.clientName}
${declineData.scheduledDateTime ? `Scheduled: ${declineData.scheduledDateTime.toLocaleString()}` : ''}
Declined At: ${declineData.declinedAt.toLocaleString()}

You need to reassign this job to another engineer.

View job details and reassign: ${jobUrl}
  `.trim();
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send job approval notification to client
 */
export async function sendJobApprovalNotification(clientEmail: string, approvalData: {
  clientName: string;
  siteName: string;
  siteAddress: string;
  scheduledDateTime?: Date;
  trackingToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `✅ Service Request Approved - ${approvalData.siteName}`;
  
  const base = approvalData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${approvalData.trackingToken}`;
  
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
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">✅ Service Request Approved</h2>
        </div>
        <div class="content">
          <p>Dear ${approvalData.clientName},</p>
          
          <div class="success-box">
            <strong>Good News!</strong> Your service request has been approved and is now being processed.
          </div>
          
          <p>Our team is now assigning an engineer to your job. You will receive another notification once an engineer has been assigned and accepts the job.</p>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${approvalData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${approvalData.siteAddress}</div>
          </div>
          
          ${approvalData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Scheduled Date & Time:</div>
            <div class="value">${approvalData.scheduledDateTime.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          ` : ''}
          
          <a href="${trackingUrl}" class="button">
            Track Your Request →
          </a>
          
          <div class="footer">
            <p><strong>What happens next?</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>An engineer will be assigned to your job</li>
              <li>The engineer will review and accept the assignment</li>
              <li>You'll receive notifications as the job progresses</li>
              <li>You can track the engineer's location in real-time</li>
              <li>After completion, you'll receive a Site Visit Report</li>
            </ol>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Service Request Approved

Dear ${approvalData.clientName},

Your service request has been approved and is now being processed.

Site: ${approvalData.siteName}
Address: ${approvalData.siteAddress}
${approvalData.scheduledDateTime ? `Scheduled: ${approvalData.scheduledDateTime.toLocaleString()}` : ''}

What happens next:
1. An engineer will be assigned to your job
2. The engineer will review and accept the assignment
3. You'll receive notifications as the job progresses
4. You can track the engineer's location in real-time
5. After completion, you'll receive a Site Visit Report

Track your request: ${trackingUrl}
  `.trim();
  
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send job rejection notification to client
 */
export async function sendJobRejectionNotification(clientEmail: string, rejectionData: {
  clientName: string;
  siteName: string;
  siteAddress: string;
  scheduledDateTime?: Date;
  rejectionReason?: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `Service Request Update - ${rejectionData.siteName}`;
  
  const base = rejectionData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const contactUrl = `${base}/request`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Service Request Update</h2>
        </div>
        <div class="content">
          <p>Dear ${rejectionData.clientName},</p>
          
          <div class="info-box">
            We regret to inform you that we are unable to proceed with your service request at this time.
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${rejectionData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${rejectionData.siteAddress}</div>
          </div>
          
          ${rejectionData.scheduledDateTime ? `
          <div class="detail-row">
            <div class="label">Requested Date & Time:</div>
            <div class="value">${rejectionData.scheduledDateTime.toLocaleString('en-GB', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
          </div>
          ` : ''}
          
          ${rejectionData.rejectionReason ? `
          <div class="detail-row">
            <div class="label">Reason:</div>
            <div class="value">${rejectionData.rejectionReason}</div>
          </div>
          ` : ''}
          
          <p><strong>What you can do:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Contact our support team for more information</li>
            <li>Submit a new request with updated details</li>
            <li>Discuss alternative solutions with our team</li>
          </ul>
          
          <a href="${contactUrl}" class="button">
            Submit New Request →
          </a>
          
          <div class="footer">
            <p>We apologize for any inconvenience. If you have questions or would like to discuss this further, please contact our support team.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Service Request Update

Dear ${rejectionData.clientName},

We regret to inform you that we are unable to proceed with your service request at this time.

Site: ${rejectionData.siteName}
Address: ${rejectionData.siteAddress}
${rejectionData.scheduledDateTime ? `Requested Date: ${rejectionData.scheduledDateTime.toLocaleString()}` : ''}
${rejectionData.rejectionReason ? `Reason: ${rejectionData.rejectionReason}` : ''}

What you can do:
- Contact our support team for more information
- Submit a new request with updated details
- Discuss alternative solutions with our team

Submit a new request: ${contactUrl}
  `.trim();
  
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}



/**
 * Send notification to admin when engineer proposes a different time
 */
export async function sendTimeCounterProposalNotification(adminEmail: string, proposalData: {
  engineerName: string;
  engineerEmail: string;
  jobId: number;
  siteName: string;
  siteAddress: string;
  clientName: string;
  requestedStartDate?: Date;
  requestedStartTime?: string;
  proposedStartDate?: Date;
  proposedStartTime?: string;
  counterProposedDate: Date;
  counterProposedTime?: string;
  counterProposalNotes?: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `⏰ Time Change Request: ${proposalData.engineerName} - ${proposalData.siteName}`;
  
  const base = proposalData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const jobUrl = `${base}/admin/job/${proposalData.jobId}`;
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { dateStyle: 'full' });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .comparison-box { background-color: #e0f2fe; border: 1px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .time-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .time-label { font-weight: bold; color: #0369a1; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #16a34a; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">⏰ Engineer Proposed Different Time</h2>
        </div>
        <div class="content">
          <div class="warning-box">
            <strong>${proposalData.engineerName}</strong> has accepted the job but proposed a different start time.
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${proposalData.engineerName} (${proposalData.engineerEmail})</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${proposalData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${proposalData.clientName}</div>
          </div>
          
          <div class="comparison-box">
            <h3 style="margin-top: 0; color: #0369a1;">Time Comparison</h3>
            
            <div class="time-row">
              <span class="time-label">Client Requested:</span>
              <span>${proposalData.requestedStartDate ? formatDate(proposalData.requestedStartDate) : 'Not specified'} ${proposalData.requestedStartTime || ''}</span>
            </div>
            
            ${proposalData.proposedStartDate ? `
            <div class="time-row">
              <span class="time-label">Admin Proposed:</span>
              <span>${formatDate(proposalData.proposedStartDate)} ${proposalData.proposedStartTime || ''}</span>
            </div>
            ` : ''}
            
            <div class="time-row" style="border-bottom: none;">
              <span class="time-label">Engineer Counter-Proposal:</span>
              <span class="new-time">${formatDate(proposalData.counterProposedDate)} ${proposalData.counterProposedTime || ''}</span>
            </div>
          </div>
          
          ${proposalData.counterProposalNotes ? `
          <div class="detail-row">
            <div class="label">Engineer's Reason:</div>
            <div class="value" style="font-style: italic;">"${proposalData.counterProposalNotes}"</div>
          </div>
          ` : ''}
          
          <a href="${jobUrl}" class="button">
            Review & Approve Time Change →
          </a>
          
          <div class="footer">
            <p><strong>Action Required:</strong> Please review the engineer's proposed time and either approve it or contact the engineer to discuss alternatives.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Engineer Proposed Different Time

Engineer: ${proposalData.engineerName} (${proposalData.engineerEmail})
Site: ${proposalData.siteName}
Client: ${proposalData.clientName}

TIME COMPARISON:
Client Requested: ${proposalData.requestedStartDate ? formatDate(proposalData.requestedStartDate) : 'Not specified'} ${proposalData.requestedStartTime || ''}
${proposalData.proposedStartDate ? `Admin Proposed: ${formatDate(proposalData.proposedStartDate)} ${proposalData.proposedStartTime || ''}` : ''}
Engineer Counter-Proposal: ${formatDate(proposalData.counterProposedDate)} ${proposalData.counterProposedTime || ''}

${proposalData.counterProposalNotes ? `Engineer's Reason: "${proposalData.counterProposalNotes}"` : ''}

Review job details: ${jobUrl}

Action Required: Please review the engineer's proposed time and either approve it or contact the engineer to discuss alternatives.
  `.trim();
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send notification to client when admin adjusts the requested time
 */
export async function sendTimeAdjustmentNotification(clientEmail: string, adjustmentData: {
  clientName: string;
  siteName: string;
  siteAddress: string;
  requestedStartDate?: Date;
  requestedStartTime?: string;
  proposedStartDate: Date;
  proposedStartTime?: string;
  timeNegotiationNotes?: string;
  trackingToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `Schedule Adjusted: ${adjustmentData.siteName}`;
  
  const base = adjustmentData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${adjustmentData.trackingToken}`;
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { dateStyle: 'full' });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .info-box { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .comparison-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .time-row { padding: 8px 0; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #16a34a; font-weight: bold; font-size: 1.1em; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📅 Service Schedule Adjusted</h2>
        </div>
        <div class="content">
          <p>Dear ${adjustmentData.clientName},</p>
          
          <div class="info-box">
            We've adjusted the start time for your service request at <strong>${adjustmentData.siteName}</strong> to better coordinate with engineer availability.
          </div>
          
          <div class="comparison-box">
            <h3 style="margin-top: 0; color: #16a34a;">Updated Schedule</h3>
            
            ${adjustmentData.requestedStartDate ? `
            <div class="time-row">
              <div class="label">Originally Requested:</div>
              <div class="old-time">${formatDate(adjustmentData.requestedStartDate)} ${adjustmentData.requestedStartTime || ''}</div>
            </div>
            ` : ''}
            
            <div class="time-row">
              <div class="label">New Scheduled Time:</div>
              <div class="new-time">${formatDate(adjustmentData.proposedStartDate)} ${adjustmentData.proposedStartTime || ''}</div>
            </div>
          </div>
          
          ${adjustmentData.timeNegotiationNotes ? `
          <div class="detail-row">
            <div class="label">Reason for Adjustment:</div>
            <div class="value" style="font-style: italic;">"${adjustmentData.timeNegotiationNotes}"</div>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <div class="label">Site Location:</div>
            <div class="value">${adjustmentData.siteAddress}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            Track Your Service Request →
          </a>
          
          <div class="footer">
            <p>If this new time doesn't work for you, please contact us immediately to discuss alternatives.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Service Schedule Adjusted

Dear ${adjustmentData.clientName},

We've adjusted the start time for your service request at ${adjustmentData.siteName}.

${adjustmentData.requestedStartDate ? `Originally Requested: ${formatDate(adjustmentData.requestedStartDate)} ${adjustmentData.requestedStartTime || ''}` : ''}
New Scheduled Time: ${formatDate(adjustmentData.proposedStartDate)} ${adjustmentData.proposedStartTime || ''}

${adjustmentData.timeNegotiationNotes ? `Reason: "${adjustmentData.timeNegotiationNotes}"` : ''}

Site Location: ${adjustmentData.siteAddress}

Track your request: ${trackingUrl}

If this new time doesn't work for you, please contact us immediately to discuss alternatives.
  `.trim();
  
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}



/**
 * Send notification to client when admin approves engineer's time counter-proposal
 */
export async function sendClientTimeChangeNotification(clientEmail: string, timeChangeData: {
  clientName: string;
  siteName: string;
  siteAddress: string;
  engineerName: string;
  originalStartDate?: Date;
  originalStartTime?: string;
  newStartDate: Date;
  newStartTime?: string;
  counterProposalNotes?: string;
  trackingToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `Job Schedule Updated - ${timeChangeData.siteName}`;
  
  const base = timeChangeData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const trackingUrl = `${base}/track/${timeChangeData.trackingToken}`;
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { dateStyle: 'full' });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { color: #1f2937; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .comparison-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .time-row { padding: 8px 0; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #16a34a; font-weight: bold; font-size: 1.1em; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">⏰ Job Schedule Updated</h2>
        </div>
        <div class="content">
          <p>Dear ${timeChangeData.clientName},</p>
          
          <div class="warning-box">
            Your scheduled service for <strong>${timeChangeData.siteName}</strong> has been updated based on engineer availability.
          </div>
          
          <div class="comparison-box">
            <h3 style="margin-top: 0; color: #16a34a;">Updated Schedule</h3>
            
            ${timeChangeData.originalStartDate ? `
            <div class="time-row">
              <div class="label">Original Time:</div>
              <div class="old-time">${formatDate(timeChangeData.originalStartDate)} ${timeChangeData.originalStartTime || ''}</div>
            </div>
            ` : ''}
            
            <div class="time-row">
              <div class="label">New Time:</div>
              <div class="new-time">${formatDate(timeChangeData.newStartDate)} ${timeChangeData.newStartTime || ''}</div>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="label">Engineer:</div>
            <div class="value">${timeChangeData.engineerName}</div>
          </div>
          
          ${timeChangeData.counterProposalNotes ? `
          <div class="detail-row">
            <div class="label">Reason for Change:</div>
            <div class="value" style="font-style: italic;">"${timeChangeData.counterProposalNotes}"</div>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <div class="label">Site Location:</div>
            <div class="value">${timeChangeData.siteAddress}</div>
          </div>
          
          <a href="${trackingUrl}" class="button">
            Track Your Job →
          </a>
          
          <div class="footer">
            <p><strong>Important:</strong> The engineer has been assigned and will arrive at the new scheduled time.</p>
            <p>If this new time doesn't work for you, please contact us immediately to discuss alternatives.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Job Schedule Updated

Dear ${timeChangeData.clientName},

Your scheduled service for ${timeChangeData.siteName} has been updated.

${timeChangeData.originalStartDate ? `Original Time: ${formatDate(timeChangeData.originalStartDate)} ${timeChangeData.originalStartTime || ''}` : ''}
New Time: ${formatDate(timeChangeData.newStartDate)} ${timeChangeData.newStartTime || ''}

Engineer: ${timeChangeData.engineerName}
${timeChangeData.counterProposalNotes ? `Reason: "${timeChangeData.counterProposalNotes}"` : ''}

Site Location: ${timeChangeData.siteAddress}

Track your job: ${trackingUrl}

If this new time doesn't work for you, please contact us immediately to discuss alternatives.
  `.trim();
  
  return await sendEmail({
    to: clientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send notification to engineer when admin approves their time counter-proposal
 */
export async function sendEngineerTimeChangeApprovalNotification(engineerEmail: string, approvalData: {
  engineerName: string;
  siteName: string;
  siteAddress: string;
  clientName: string;
  confirmedStartDate: Date;
  confirmedStartTime?: string;
  jobToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const subject = `Time Change Approved - ${approvalData.siteName}`;
  
  const base = approvalData.baseUrl || process.env.PUBLIC_URL || 'https://transputec-dispatch.manus.space';
  const jobUrl = `${base}/job/${approvalData.jobToken}`;
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { dateStyle: 'full' });
  
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
        .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .time-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .confirmed-time { color: #16a34a; font-weight: bold; font-size: 1.3em; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">✅ Time Change Approved</h2>
        </div>
        <div class="content">
          <p>Hi ${approvalData.engineerName},</p>
          
          <div class="success-box">
            Your proposed time change has been <strong>approved</strong> by the admin.
          </div>
          
          <div class="time-box">
            <div class="label" style="margin-bottom: 10px;">Confirmed Time:</div>
            <div class="confirmed-time">${formatDate(approvalData.confirmedStartDate)} ${approvalData.confirmedStartTime || ''}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Name:</div>
            <div class="value">${approvalData.siteName}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Site Address:</div>
            <div class="value">${approvalData.siteAddress}</div>
          </div>
          
          <div class="detail-row">
            <div class="label">Client:</div>
            <div class="value">${approvalData.clientName}</div>
          </div>
          
          <a href="${jobUrl}" class="button">
            View Job Details →
          </a>
          
          <div class="footer">
            <p><strong>Important:</strong> Please ensure you arrive at the confirmed time.</p>
            <p>The client has been notified of the schedule change.</p>
            <p>This is an automated notification from FieldPulse Go Dispatch System.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Time Change Approved

Hi ${approvalData.engineerName},

Your proposed time change has been approved by the admin.

Confirmed Time: ${formatDate(approvalData.confirmedStartDate)} ${approvalData.confirmedStartTime || ''}

Site Name: ${approvalData.siteName}
Site Address: ${approvalData.siteAddress}
Client: ${approvalData.clientName}

View job details: ${jobUrl}

Important: Please ensure you arrive at the confirmed time.
The client has been notified of the schedule change.
  `.trim();
  
  return await sendEmail({
    to: engineerEmail,
    subject,
    html,
    text,
  });
}

