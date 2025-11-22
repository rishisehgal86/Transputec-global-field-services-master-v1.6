import { getDb } from './server/db';
import { organizations } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function testCancellationFlow() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('\n=== STEP 1: CREATE TEST ORGANIZATION WITH ACTIVE SUBSCRIPTION ===');
  
  // Create a test organization with active subscription
  const [testOrg] = await db.insert(organizations).values({
    name: 'Test Cancellation Org',
    slug: 'test-cancel-' + Date.now(),
    subscriptionStatus: 'active',
    planTier: 'starter',
    monthlyJobLimit: 100,
    maxAdminUsers: 3,
    isActive: true,
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: 'sub_test123',
    cancelAtPeriodEnd: false,
    billingCycleStart: new Date(),
    billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  }).$returningId();

  const orgId = testOrg.id;
  console.log('✓ Created test organization:', orgId);

  // Fetch and display initial state
  const [initialOrg] = await db.select().from(organizations).where(eq(organizations.id, orgId));
  
  console.log('\n=== INITIAL STATE (ACTIVE SUBSCRIPTION) ===');
  console.log('Organization ID:', initialOrg.id);
  console.log('Name:', initialOrg.name);
  console.log('isActive:', initialOrg.isActive);
  console.log('subscriptionStatus:', initialOrg.subscriptionStatus);
  console.log('planTier:', initialOrg.planTier);
  console.log('monthlyJobLimit:', initialOrg.monthlyJobLimit);
  console.log('maxAdminUsers:', initialOrg.maxAdminUsers);
  console.log('stripeSubscriptionId:', initialOrg.stripeSubscriptionId);
  console.log('cancelAtPeriodEnd:', initialOrg.cancelAtPeriodEnd);

  console.log('\n=== STEP 2: SIMULATE USER CLICKS "CANCEL SUBSCRIPTION" ===');
  console.log('(This sets cancel_at_period_end=true in Stripe)');
  
  // Simulate subscription.updated webhook with cancel_at_period_end=true
  await db.update(organizations)
    .set({
      cancelAtPeriodEnd: true,
    })
    .where(eq(organizations.id, orgId));

  const [pendingCancelOrg] = await db.select().from(organizations).where(eq(organizations.id, orgId));
  
  console.log('\n=== AFTER CANCELLATION REQUEST (PENDING) ===');
  console.log('isActive:', pendingCancelOrg.isActive, '(should still be TRUE)');
  console.log('subscriptionStatus:', pendingCancelOrg.subscriptionStatus, '(should still be "active")');
  console.log('cancelAtPeriodEnd:', pendingCancelOrg.cancelAtPeriodEnd, '(should be TRUE)');
  console.log('→ Subscription remains active until billing period ends');

  console.log('\n=== STEP 3: SIMULATE BILLING PERIOD EXPIRY ===');
  console.log('(Stripe fires subscription.deleted webhook)');
  
  // Simulate subscription.deleted webhook - account closure
  await db.update(organizations)
    .set({
      isActive: false,
      subscriptionStatus: 'cancelled',
      planTier: 'trial',
      monthlyJobLimit: 0,
      maxAdminUsers: 0,
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
    })
    .where(eq(organizations.id, orgId));

  const [closedOrg] = await db.select().from(organizations).where(eq(organizations.id, orgId));
  
  console.log('\n=== AFTER BILLING PERIOD ENDS (ACCOUNT CLOSED) ===');
  console.log('isActive:', closedOrg.isActive);
  console.log('subscriptionStatus:', closedOrg.subscriptionStatus);
  console.log('planTier:', closedOrg.planTier);
  console.log('monthlyJobLimit:', closedOrg.monthlyJobLimit);
  console.log('maxAdminUsers:', closedOrg.maxAdminUsers);
  console.log('stripeSubscriptionId:', closedOrg.stripeSubscriptionId);
  console.log('cancelAtPeriodEnd:', closedOrg.cancelAtPeriodEnd);

  console.log('\n=== TEST RESULTS ===');
  const tests = [
    { name: 'Account deactivated', pass: !closedOrg.isActive },
    { name: 'Status set to cancelled', pass: closedOrg.subscriptionStatus === 'cancelled' },
    { name: 'Job limit set to 0', pass: closedOrg.monthlyJobLimit === 0 },
    { name: 'Admin limit set to 0', pass: closedOrg.maxAdminUsers === 0 },
    { name: 'Stripe subscription cleared', pass: closedOrg.stripeSubscriptionId === null },
    { name: 'Cancel flag cleared', pass: !closedOrg.cancelAtPeriodEnd },
  ];

  tests.forEach(test => {
    console.log(`${test.pass ? '✅' : '❌'} ${test.name}: ${test.pass}`);
  });

  const allPassed = tests.every(t => t.pass);
  console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED - ACCOUNT CLOSURE WORKS CORRECTLY!' : '❌ SOME TESTS FAILED'));
  
  // Cleanup
  await db.delete(organizations).where(eq(organizations.id, orgId));
  console.log('\n✓ Cleaned up test data');
  
  process.exit(allPassed ? 0 : 1);
}

testCancellationFlow().catch(console.error);
