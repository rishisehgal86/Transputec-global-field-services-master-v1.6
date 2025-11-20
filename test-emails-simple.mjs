/**
 * Simple test to verify time change email notifications
 * This script directly tests the email functions with sample data
 */

import { sendClientTimeChangeNotification, sendEngineerTimeChangeApprovalNotification } from './server/email.ts';

console.log('\n🧪 Testing Time Change Email Notifications\n');
console.log('=' .repeat(60));

// Test data
const testData = {
  client: {
    clientName: 'John Smith',
    siteName: 'Tokyo Data Center',
    siteAddress: '1-2-3 Shibuya, Tokyo 150-0002, Japan',
    engineerName: 'Jane Engineer',
    originalStartDate: new Date('2026-02-15T09:00:00Z'),
    originalStartTime: '09:00',
    newStartDate: new Date('2026-02-15T14:00:00Z'),
    newStartTime: '14:00',
    counterProposalNotes: 'I have another appointment in the morning. Can we reschedule to 2 PM?',
    trackingToken: 'test-token-12345',
    baseUrl: 'https://transputec-dispatch.manus.space',
  },
  engineer: {
    engineerName: 'Jane Engineer',
    siteName: 'Tokyo Data Center',
    siteAddress: '1-2-3 Shibuya, Tokyo 150-0002, Japan',
    clientName: 'John Smith',
    confirmedStartDate: new Date('2026-02-15T14:00:00Z'),
    confirmedStartTime: '14:00',
    jobToken: 'job-token-67890',
    baseUrl: 'https://transputec-dispatch.manus.space',
  },
};

async function runTests() {
  try {
    // Test 1: Send client notification
    console.log('\n📧 Test 1: Sending client time change notification...');
    console.log('   To: admin@field-pulse.io');
    console.log('   Site: ' + testData.client.siteName);
    console.log('   Original: ' + testData.client.originalStartTime);
    console.log('   New: ' + testData.client.newStartTime);
    
    const clientResult = await sendClientTimeChangeNotification(
      'admin@field-pulse.io',
      testData.client
    );
    
    console.log(clientResult ? '   ✅ Client email sent successfully' : '   ❌ Client email failed');

    // Test 2: Send engineer notification
    console.log('\n📧 Test 2: Sending engineer approval notification...');
    console.log('   To: admin@field-pulse.io');
    console.log('   Site: ' + testData.engineer.siteName);
    console.log('   Confirmed: ' + testData.engineer.confirmedStartTime);
    
    const engineerResult = await sendEngineerTimeChangeApprovalNotification(
      'admin@field-pulse.io',
      testData.engineer
    );
    
    console.log(engineerResult ? '   ✅ Engineer email sent successfully' : '   ❌ Engineer email failed');

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('\n📊 Test Results:');
    console.log(`   Client Email: ${clientResult ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Engineer Email: ${engineerResult ? '✅ Sent' : '❌ Failed'}`);
    
    if (clientResult && engineerResult) {
      console.log('\n✅ All tests passed!\n');
      console.log('📬 Check your inbox at admin@field-pulse.io for:');
      console.log('   1. "Job Schedule Updated - Tokyo Data Center" (client notification)');
      console.log('   2. "Time Change Approved - Tokyo Data Center" (engineer notification)\n');
    } else {
      console.log('\n❌ Some tests failed. Check the logs above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

