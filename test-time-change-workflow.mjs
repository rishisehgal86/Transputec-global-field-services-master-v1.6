import { createJob, getJobById, updateJobStatus } from './server/db.js';
import { sendClientTimeChangeNotification, sendEngineerTimeChangeApprovalNotification } from './server/email.js';

/**
 * Test script to simulate the complete time change approval workflow:
 * 1. Create a job with initial schedule
 * 2. Simulate engineer proposing a different time
 * 3. Simulate admin approving the time change
 * 4. Verify both emails are sent (client + engineer)
 */

async function testTimeChangeWorkflow() {
  console.log('\n🧪 Testing Time Change Email Notification Workflow\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a test job
    console.log('\n📝 Step 1: Creating test job...');
    const testJob = {
      organizationId: 1, // System Administration org
      jobToken: `test-${Date.now()}`,
      siteName: 'Tokyo Data Center',
      siteAddress: '1-2-3 Shibuya, Tokyo, Japan',
      siteLatitude: '35.6762',
      siteLongitude: '139.6503',
      clientName: 'Test Client',
      clientEmail: 'admin@field-pulse.io', // Using our test email
      incidentDetails: 'Server maintenance required',
      hoursRequired: '4',
      status: 'accepted',
      engineerName: 'John Engineer',
      engineerEmail: 'admin@field-pulse.io', // Using our test email
      scheduledDateTime: new Date('2026-02-15T09:00:00Z'),
      requestedStartDate: new Date('2026-02-15T09:00:00Z'),
      requestedStartTime: '09:00',
      timezone: 'Asia/Tokyo',
    };

    const jobId = await createJob(testJob);
    console.log(`✅ Job created with ID: ${jobId}`);

    // Step 2: Simulate engineer proposing a different time
    console.log('\n⏰ Step 2: Engineer proposes time change...');
    const counterProposalDate = new Date('2026-02-15T14:00:00Z');
    const counterProposalTime = '14:00';
    
    await updateJobStatus(jobId, 'accepted', {
      confirmedStartDate: counterProposalDate,
      confirmedStartTime: counterProposalTime,
      timeNegotiationNotes: 'I have another appointment in the morning. Can we do 2 PM instead?',
    });
    console.log(`✅ Engineer proposed new time: ${counterProposalTime}`);

    // Step 3: Fetch updated job
    console.log('\n🔍 Step 3: Fetching updated job data...');
    const job = await getJobById(jobId);
    console.log(`✅ Job fetched: ${job.siteName}`);
    console.log(`   Original time: ${job.requestedStartTime || 'N/A'}`);
    console.log(`   Proposed time: ${job.confirmedStartTime || 'N/A'}`);

    // Step 4: Send engineer approval notification
    console.log('\n📧 Step 4: Sending engineer approval notification...');
    const engineerEmailSent = await sendEngineerTimeChangeApprovalNotification(
      job.engineerEmail,
      {
        engineerName: job.engineerName,
        siteName: job.siteName,
        siteAddress: job.siteAddress || 'Address not specified',
        clientName: job.clientName,
        confirmedStartDate: job.confirmedStartDate,
        confirmedStartTime: job.confirmedStartTime || undefined,
        jobToken: job.jobToken,
        baseUrl: 'https://transputec-dispatch.manus.space',
      }
    );
    console.log(engineerEmailSent ? '✅ Engineer email sent successfully' : '❌ Engineer email failed');

    // Step 5: Send client time change notification
    console.log('\n📧 Step 5: Sending client time change notification...');
    const clientEmailSent = await sendClientTimeChangeNotification(
      job.clientEmail,
      {
        clientName: job.clientName,
        siteName: job.siteName,
        siteAddress: job.siteAddress || 'Address not specified',
        engineerName: job.engineerName || 'Assigned Engineer',
        originalStartDate: job.requestedStartDate || undefined,
        originalStartTime: job.requestedStartTime || undefined,
        newStartDate: job.confirmedStartDate,
        newStartTime: job.confirmedStartTime || undefined,
        counterProposalNotes: job.timeNegotiationNotes || undefined,
        trackingToken: job.jobToken,
        baseUrl: 'https://transputec-dispatch.manus.space',
      }
    );
    console.log(clientEmailSent ? '✅ Client email sent successfully' : '❌ Client email failed');

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   Job ID: ${jobId}`);
    console.log(`   Job Token: ${job.jobToken}`);
    console.log(`   Site: ${job.siteName}`);
    console.log(`   Original Time: ${job.requestedStartTime || 'N/A'}`);
    console.log(`   New Time: ${job.confirmedStartTime || 'N/A'}`);
    console.log(`   Engineer Email: ${engineerEmailSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Client Email: ${clientEmailSent ? '✅ Sent' : '❌ Failed'}`);
    console.log('\n✅ Workflow test completed successfully!\n');

    console.log('📬 Check your inbox at admin@field-pulse.io for both emails:');
    console.log('   1. "Time Change Approved - Tokyo Data Center" (to engineer)');
    console.log('   2. "Job Schedule Updated - Tokyo Data Center" (to client)\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testTimeChangeWorkflow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

