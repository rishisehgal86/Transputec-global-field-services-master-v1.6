import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendClientTimeChangeNotification, sendEngineerTimeChangeApprovalNotification } from './email';

// Mock the sendEmail function
vi.mock('./email', async () => {
  const actual = await vi.importActual('./email') as any;
  return {
    ...actual,
    sendEmail: vi.fn().mockResolvedValue(true),
  };
});

describe('Time Change Email Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendClientTimeChangeNotification', () => {
    it('should send email with correct client time change data', async () => {
      const timeChangeData = {
        clientName: 'John Doe',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        engineerName: 'Jane Smith',
        originalStartDate: new Date('2026-01-08T09:00:00Z'),
        originalStartTime: '09:00',
        newStartDate: new Date('2026-01-08T14:00:00Z'),
        newStartTime: '14:00',
        counterProposalNotes: 'Engineer availability conflict',
        trackingToken: 'test-token-123',
        baseUrl: 'https://test.example.com',
      };

      const result = await sendClientTimeChangeNotification(
        'client@example.com',
        timeChangeData
      );

      expect(result).toBe(true);
    });

    it('should handle missing optional fields gracefully', async () => {
      const timeChangeData = {
        clientName: 'John Doe',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        engineerName: 'Jane Smith',
        newStartDate: new Date('2026-01-08T14:00:00Z'),
        trackingToken: 'test-token-123',
      };

      const result = await sendClientTimeChangeNotification(
        'client@example.com',
        timeChangeData
      );

      expect(result).toBe(true);
    });

    it('should include tracking link in email', async () => {
      const { sendEmail } = await import('./email');
      
      const timeChangeData = {
        clientName: 'John Doe',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        engineerName: 'Jane Smith',
        newStartDate: new Date('2026-01-08T14:00:00Z'),
        trackingToken: 'test-token-123',
        baseUrl: 'https://test.example.com',
      };

      await sendClientTimeChangeNotification('client@example.com', timeChangeData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
          subject: expect.stringContaining('Tokyo Office'),
          html: expect.stringContaining('https://test.example.com/track/test-token-123'),
        })
      );
    });
  });

  describe('sendEngineerTimeChangeApprovalNotification', () => {
    it('should send email with correct engineer approval data', async () => {
      const approvalData = {
        engineerName: 'Jane Smith',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        clientName: 'John Doe',
        confirmedStartDate: new Date('2026-01-08T14:00:00Z'),
        confirmedStartTime: '14:00',
        jobToken: 'job-token-456',
        baseUrl: 'https://test.example.com',
      };

      const result = await sendEngineerTimeChangeApprovalNotification(
        'engineer@example.com',
        approvalData
      );

      expect(result).toBe(true);
    });

    it('should handle missing optional time field', async () => {
      const approvalData = {
        engineerName: 'Jane Smith',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        clientName: 'John Doe',
        confirmedStartDate: new Date('2026-01-08T14:00:00Z'),
        jobToken: 'job-token-456',
      };

      const result = await sendEngineerTimeChangeApprovalNotification(
        'engineer@example.com',
        approvalData
      );

      expect(result).toBe(true);
    });

    it('should include job link in email', async () => {
      const { sendEmail } = await import('./email');
      
      const approvalData = {
        engineerName: 'Jane Smith',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        clientName: 'John Doe',
        confirmedStartDate: new Date('2026-01-08T14:00:00Z'),
        jobToken: 'job-token-456',
        baseUrl: 'https://test.example.com',
      };

      await sendEngineerTimeChangeApprovalNotification('engineer@example.com', approvalData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'engineer@example.com',
          subject: expect.stringContaining('Tokyo Office'),
          html: expect.stringContaining('https://test.example.com/job/job-token-456'),
        })
      );
    });
  });

  describe('Email content validation', () => {
    it('should include time comparison in client email', async () => {
      const { sendEmail } = await import('./email');
      
      const timeChangeData = {
        clientName: 'John Doe',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        engineerName: 'Jane Smith',
        originalStartDate: new Date('2026-01-08T09:00:00Z'),
        originalStartTime: '09:00',
        newStartDate: new Date('2026-01-08T14:00:00Z'),
        newStartTime: '14:00',
        trackingToken: 'test-token-123',
      };

      await sendClientTimeChangeNotification('client@example.com', timeChangeData);

      const callArgs = (sendEmail as any).mock.calls[0][0];
      expect(callArgs.html).toContain('Original Time');
      expect(callArgs.html).toContain('New Time');
    });

    it('should include engineer name in client email', async () => {
      const { sendEmail } = await import('./email');
      
      const timeChangeData = {
        clientName: 'John Doe',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        engineerName: 'Jane Smith',
        newStartDate: new Date('2026-01-08T14:00:00Z'),
        trackingToken: 'test-token-123',
      };

      await sendClientTimeChangeNotification('client@example.com', timeChangeData);

      const callArgs = (sendEmail as any).mock.calls[0][0];
      expect(callArgs.html).toContain('Jane Smith');
    });

    it('should include confirmed time in engineer email', async () => {
      const { sendEmail } = await import('./email');
      
      const approvalData = {
        engineerName: 'Jane Smith',
        siteName: 'Tokyo Office',
        siteAddress: '123 Main St, Tokyo',
        clientName: 'John Doe',
        confirmedStartDate: new Date('2026-01-08T14:00:00Z'),
        confirmedStartTime: '14:00',
        jobToken: 'job-token-456',
      };

      await sendEngineerTimeChangeApprovalNotification('engineer@example.com', approvalData);

      const callArgs = (sendEmail as any).mock.calls[0][0];
      expect(callArgs.html).toContain('Confirmed Time');
    });
  });
});

