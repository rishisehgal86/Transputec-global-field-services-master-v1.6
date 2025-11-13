import { formatTimestampDual } from "@shared/timezone";

interface EngineerAssignmentEmailData {
  engineerName: string;
  jobId: number;
  siteName: string;
  siteAddress: string;
  scheduledDateTime?: Date;
  timezone?: string;
  incidentDetails?: string;
  engineerLink: string;
}

/**
 * Generate HTML email for engineer job assignment
 * Clean, professional template with basic job info and secure link
 */
export function generateEngineerAssignmentEmail(data: EngineerAssignmentEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    engineerName,
    jobId,
    siteName,
    siteAddress,
    scheduledDateTime,
    timezone,
    incidentDetails,
    engineerLink,
  } = data;

  const timeDisplay = scheduledDateTime && timezone
    ? formatTimestampDual(scheduledDateTime, timezone)
    : 'TBD';

  const subject = `New Job Assignment #${jobId} - ${siteName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                New Job Assignment
              </h1>
              <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.95;">
                Job #${jobId}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px; color: #1f2937; font-size: 16px;">
                Hi ${engineerName},
              </p>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                You have been assigned to a new field service job. Please review the details below and access the full job information using the secure link.
              </p>

              <!-- Job Details Card -->
              <div style="background-color: #f9fafb; border-left: 4px solid #ff6b35; padding: 20px; margin: 0 0 24px; border-radius: 4px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Site
                      </p>
                      <p style="margin: 4px 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                        ${siteName}
                      </p>
                      <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">
                        ${siteAddress}
                      </p>
                    </td>
                  </tr>
                  
                  ${scheduledDateTime ? `
                  <tr>
                    <td style="padding: 16px 0 8px;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Scheduled Time
                      </p>
                      <p style="margin: 4px 0 0; color: #1f2937; font-size: 15px;">
                        ${timeDisplay}
                      </p>
                    </td>
                  </tr>
                  ` : ''}

                  ${incidentDetails ? `
                  <tr>
                    <td style="padding: 16px 0 8px;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Description
                      </p>
                      <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                        ${incidentDetails.substring(0, 150)}${incidentDetails.length > 150 ? '...' : ''}
                      </p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${engineerLink}" style="display: inline-block; padding: 14px 32px; background-color: #ff6b35; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);">
                      View Full Job Details & Accept
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Click the button above to access the secure job portal where you can view complete details, accept or decline the assignment, and update job status.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                This is an automated message from FieldPulse Go. Please do not reply to this email.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                If you have questions, please contact your dispatcher.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
New Job Assignment #${jobId}

Hi ${engineerName},

You have been assigned to a new field service job.

JOB DETAILS:
Site: ${siteName}
Address: ${siteAddress}
${scheduledDateTime ? `Scheduled Time: ${timeDisplay}` : ''}
${incidentDetails ? `Description: ${incidentDetails}` : ''}

View full job details and accept/decline:
${engineerLink}

---
This is an automated message from FieldPulse Go.
If you have questions, please contact your dispatcher.
  `.trim();

  return { subject, html, text };
}

