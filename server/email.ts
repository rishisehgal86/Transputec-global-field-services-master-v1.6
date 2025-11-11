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
}

// Gmail SMTP Configuration
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
const FROM_NAME = 'DespatchApp';

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
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Transputec Field Engineer Services</p>
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
            <p>This Site Visit Report was generated by Transputec Field Engineer Dispatch System.</p>
            <p>For any questions or concerns, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
SITE VISIT REPORT
Transputec Field Engineer Services

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

This Site Visit Report was generated by Transputec Field Engineer Dispatch System.
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
            <p>This is an automated notification from Transputec Field Engineer Dispatch System.</p>
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

This is an automated notification from Transputec Field Engineer Dispatch System.
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
            <p>This is an automated notification from Transputec Field Engineer Dispatch System.</p>
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

This is an automated notification from Transputec Field Engineer Dispatch System.
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
            <p>This is an automated notification from Transputec Field Engineer Dispatch System.</p>
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

This is an automated notification from Transputec Field Engineer Dispatch System.
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
            <p>Thank you for using Transputec Field Engineer Services.</p>
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

Thank you for using Transputec Field Engineer Services.
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
          <p>© 2025 Transputec. Global IT Service Provider.</p>
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

