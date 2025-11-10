import { sendNewTicketNotification, sendClientConfirmation } from './server/email.ts';

async function testNotifications() {
  console.log('🧪 Testing email notifications...\n');
  
  const testData = {
    clientName: 'Test Client',
    clientEmail: 'rishis@transputec.com',
    siteName: 'Test Site',
    siteAddress: '123 Test Street, Dubai',
    scheduledDateTime: new Date(),
    incidentDetails: 'This is a test incident',
    hoursRequired: '2 hours',
    ticketId: 999,
    trackingToken: 'test-token-123',
  };
  
  console.log('📧 Test 1: Sending admin notification to rishi@karrdservicesuae.com...\n');
  try {
    const result1 = await sendNewTicketNotification({
      ...testData,
      adminEmail: 'rishi@karrdservicesuae.com',
    });
    console.log('Result:', result1 ? '✅ Success' : '❌ Failed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n📧 Test 2: Sending client confirmation to rishis@transputec.com...\n');
  try {
    const result2 = await sendClientConfirmation(testData);
    console.log('Result:', result2 ? '✅ Success' : '❌ Failed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n✅ Test complete! Check the email inboxes.');
}

testNotifications().catch(console.error);

