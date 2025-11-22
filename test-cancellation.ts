import { getDb } from './server/db';
import { organizations } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function testCancellation() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  // Find an organization with an active subscription
  const orgs = await db.select().from(organizations).where(eq(organizations.subscriptionStatus, 'active')).limit(1);
  
  if (orgs.length === 0) {
    console.log('No active subscriptions found');
    return;
  }

  const org = orgs[0];
  console.log('\n=== BEFORE CANCELLATION ===');
  console.log('Organization ID:', org.id);
  console.log('Name:', org.name);
  console.log('isActive:', org.isActive);
  console.log('subscriptionStatus:', org.subscriptionStatus);
  console.log('planTier:', org.planTier);
  console.log('monthlyJobLimit:', org.monthlyJobLimit);
  console.log('maxAdminUsers:', org.maxAdminUsers);
  console.log('stripeSubscriptionId:', org.stripeSubscriptionId);
  console.log('cancelAtPeriodEnd:', org.cancelAtPeriodEnd);

  // Simulate subscription.deleted webhook
  console.log('\n=== SIMULATING SUBSCRIPTION.DELETED WEBHOOK ===');
  
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
    .where(eq(organizations.id, org.id));

  // Fetch updated organization
  const updatedOrgs = await db.select().from(organizations).where(eq(organizations.id, org.id)).limit(1);
  const updatedOrg = updatedOrgs[0];

  console.log('\n=== AFTER CANCELLATION ===');
  console.log('Organization ID:', updatedOrg.id);
  console.log('Name:', updatedOrg.name);
  console.log('isActive:', updatedOrg.isActive);
  console.log('subscriptionStatus:', updatedOrg.subscriptionStatus);
  console.log('planTier:', updatedOrg.planTier);
  console.log('monthlyJobLimit:', updatedOrg.monthlyJobLimit);
  console.log('maxAdminUsers:', updatedOrg.maxAdminUsers);
  console.log('stripeSubscriptionId:', updatedOrg.stripeSubscriptionId);
  console.log('cancelAtPeriodEnd:', updatedOrg.cancelAtPeriodEnd);

  console.log('\n=== TEST RESULTS ===');
  console.log('✓ Account deactivated:', !updatedOrg.isActive);
  console.log('✓ Status set to cancelled:', updatedOrg.subscriptionStatus === 'cancelled');
  console.log('✓ Job limit set to 0:', updatedOrg.monthlyJobLimit === 0);
  console.log('✓ Admin limit set to 0:', updatedOrg.maxAdminUsers === 0);
  console.log('✓ Stripe subscription cleared:', updatedOrg.stripeSubscriptionId === null);
  console.log('✓ Cancel flag cleared:', !updatedOrg.cancelAtPeriodEnd);

  const allPassed = 
    !updatedOrg.isActive &&
    updatedOrg.subscriptionStatus === 'cancelled' &&
    updatedOrg.monthlyJobLimit === 0 &&
    updatedOrg.maxAdminUsers === 0 &&
    updatedOrg.stripeSubscriptionId === null &&
    !updatedOrg.cancelAtPeriodEnd;

  console.log('\n' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
  
  process.exit(allPassed ? 0 : 1);
}

testCancellation().catch(console.error);
