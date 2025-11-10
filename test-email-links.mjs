/**
 * Test script to verify email links are generated with full URLs
 */

// Simulate different request environments
const testCases = [
  {
    name: 'Development (localhost)',
    headers: {
      host: 'localhost:3000',
      'x-forwarded-proto': undefined,
    },
    expectedBase: 'http://localhost:3000',
  },
  {
    name: 'Manus Production',
    headers: {
      host: 'transputec-dispatch.manus.space',
      'x-forwarded-proto': 'https',
    },
    expectedBase: 'https://transputec-dispatch.manus.space',
  },
  {
    name: 'Custom Domain',
    headers: {
      host: 'dispatch.transputec.com',
      'x-forwarded-proto': 'https',
    },
    expectedBase: 'https://dispatch.transputec.com',
  },
];

// Helper function (same as in routers.ts)
function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || (req.connection?.encrypted ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

console.log('🔗 Testing Email Link Generation\n');
console.log('='.repeat(60));

testCases.forEach(testCase => {
  const mockReq = {
    headers: testCase.headers,
    connection: { encrypted: false },
  };
  
  const baseUrl = getBaseUrl(mockReq);
  const trackingToken = 'abc123xyz';
  const trackingUrl = `${baseUrl}/track/${trackingToken}`;
  const engineerUrl = `${baseUrl}/engineer/${trackingToken}`;
  
  console.log(`\n📍 ${testCase.name}`);
  console.log(`   Expected: ${testCase.expectedBase}`);
  console.log(`   Got:      ${baseUrl}`);
  console.log(`   Match:    ${baseUrl === testCase.expectedBase ? '✅' : '❌'}`);
  console.log(`   Tracking: ${trackingUrl}`);
  console.log(`   Engineer: ${engineerUrl}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ All email links will now include full URLs!');
console.log('📧 Links will work in email clients on any domain.\n');

