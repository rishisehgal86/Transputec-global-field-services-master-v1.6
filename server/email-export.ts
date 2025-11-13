import { generateExcelExport, generateCSVExport } from './excel-export';

interface EmailExportOptions {
  recipientEmail: string;
  recipientName?: string;
  exportData: any[];
  format: 'csv' | 'excel';
  dateRange: {
    start: string;
    end: string;
  };
  status?: string;
}

/**
 * Send export report via email
 * @param options Email export configuration
 * @returns Success status
 */
export async function sendExportEmail(options: EmailExportOptions): Promise<boolean> {
  const { recipientEmail, recipientName, exportData, format, dateRange, status } = options;
  
  try {
    // Generate file based on format
    let attachment: { filename: string; content: Buffer | string; contentType: string };
    
    if (format === 'excel') {
      const excelBuffer = generateExcelExport(
        exportData,
        `jobs_export_${dateRange.start}_to_${dateRange.end}`
      );
      attachment = {
        filename: `jobs_export_${dateRange.start}_to_${dateRange.end}.xlsx`,
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } else {
      const csvContent = generateCSVExport(exportData);
      attachment = {
        filename: `jobs_export_${dateRange.start}_to_${dateRange.end}.csv`,
        content: csvContent,
        contentType: 'text/csv',
      };
    }
    
    // Prepare email content
    const statusText = status && status !== 'all' ? ` (Status: ${status})` : '';
    const subject = `FieldPulse Go - Jobs Export Report (${dateRange.start} to ${dateRange.end})`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: 600; color: #6b7280; }
          .detail-value { color: #111827; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Jobs Export Report</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">FieldPulse Go Dispatch System</p>
          </div>
          <div class="content">
            <p>Hello${recipientName ? ` ${recipientName}` : ''},</p>
            <p>Your requested jobs export report is ready. Please find the attached file with the following details:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Date Range:</span>
                <span class="detail-value">${dateRange.start} to ${dateRange.end}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status Filter:</span>
                <span class="detail-value">${status && status !== 'all' ? status : 'All Statuses'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Format:</span>
                <span class="detail-value">${format.toUpperCase()}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Total Jobs:</span>
                <span class="detail-value">${exportData.length}</span>
              </div>
            </div>
            
            <p>The export includes the following information for each job:</p>
            <ul>
              <li>Job ID and Site Name</li>
              <li>Site Address and Client Name</li>
              <li>Contact Number and Status</li>
              <li>Assigned Engineer</li>
              <li>Scheduled, Created, and Completed Dates</li>
            </ul>
            
            <p style="margin-top: 30px;">If you have any questions about this export, please contact your administrator.</p>
          </div>
          <div class="footer">
            <p>© 2025 FieldPulse Go. Instant Coverage. Always in Sync.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email using the existing email utility
    const { sendEmail } = await import('./email');
    await sendEmail({
      to: recipientEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
        },
      ],
    });
    
    console.log(`[Email Export] Sent ${format.toUpperCase()} export to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('[Email Export] Failed to send export email:', error);
    return false;
  }
}

