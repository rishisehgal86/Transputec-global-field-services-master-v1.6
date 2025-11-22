import { stripe, SUBSCRIPTION_PLANS, getPlanByTier } from './stripe-config';
import { updateOrganizationSubscription } from './db';

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(params: {
  organizationId: number;
  planTier: 'starter' | 'enterprise';
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { organizationId, planTier, customerEmail, successUrl, cancelUrl } = params;
  
  const plan = getPlanByTier(planTier);
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        organizationId: organizationId.toString(),
        planTier: planTier,
      },
      subscription_data: {
        metadata: {
          organizationId: organizationId.toString(),
          planTier: planTier,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });
    
    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('[Stripe] Failed to create checkout session:', error);
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('[Stripe] Error message:', error.message);
      console.error('[Stripe] Error stack:', error.stack);
    }
    throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a Stripe Customer Portal session for subscription management
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  const { customerId, returnUrl } = params;
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return {
      url: session.url,
    };
  } catch (error) {
    console.error('[Stripe] Failed to create portal session:', error);
    throw new Error('Failed to create portal session');
  }
}

/**
 * Cancel a subscription at the end of the current billing period
 * This allows users to continue using the service until their paid period ends
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    // Cancel at period end instead of immediately
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('[Stripe] Failed to cancel subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Upgrade an existing subscription to a new plan
 */
export async function upgradeSubscription(params: {
  subscriptionId: string;
  newPlanTier: 'starter' | 'enterprise';
}) {
  const { subscriptionId, newPlanTier } = params;
  const newPlan = getPlanByTier(newPlanTier);
  
  try {
    // Update the subscription to the new price
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItemId = subscription.items.data[0].id;
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItemId,
          price: newPlan.priceId,
        },
      ],
      proration_behavior: 'always_invoice', // Charge prorated amount immediately
      metadata: {
        organizationId: subscription.metadata.organizationId,
        planTier: newPlanTier,
      },
    });
    
    console.log(`[Stripe] Subscription ${subscriptionId} upgraded to ${newPlanTier}`);
    return updatedSubscription;
  } catch (error) {
    console.error('[Stripe] Failed to upgrade subscription:', error);
    throw new Error(`Failed to upgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('[Stripe] Failed to retrieve subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

/**
 * Handle successful subscription creation (called from webhook)
 * Updated: 2025-11-22 - Fixed customer object handling and date validation
 */
export async function handleSubscriptionCreated(subscription: any) {
  console.log('[Stripe] Raw subscription object:', JSON.stringify({
    id: subscription.id,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    customer: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    status: subscription.status,
  }));
  
  const organizationId = parseInt(subscription.metadata.organizationId);
  const planTier = subscription.metadata.planTier as 'starter' | 'enterprise';
  const plan = getPlanByTier(planTier);
  
  // Extract billing period dates from subscription items
  // Stripe stores these in items.data[0], not at the top level
  const subscriptionItem = subscription.items?.data?.[0];
  
  if (!subscriptionItem?.current_period_start || !subscriptionItem?.current_period_end) {
    console.error('[Stripe] Subscription missing period dates in items:', {
      id: subscription.id,
      hasItems: !!subscription.items,
      itemsCount: subscription.items?.data?.length,
      firstItem: subscriptionItem,
    });
    throw new Error('Subscription missing billing period dates in items');
  }
  
  // Calculate billing cycle dates from subscription item
  const billingCycleStart = new Date(subscriptionItem.current_period_start * 1000);
  const billingCycleEnd = new Date(subscriptionItem.current_period_end * 1000);
  
  console.log('[Stripe] Processing subscription with dates:', {
    billingCycleStart: billingCycleStart.toISOString(),
    billingCycleEnd: billingCycleEnd.toISOString(),
  });
  
  await updateOrganizationSubscription({
    organizationId,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    planTier: planTier,
    subscriptionStatus: subscription.status,
    monthlyJobLimit: plan.features.monthlyJobLimit,
    maxAdminUsers: plan.features.maxAdminUsers,
    billingCycleStart,
    billingCycleEnd,
    currentMonthJobCount: 0,
    trialEndsAt: null, // Clear trial when subscription starts
  });
  
  console.log(`[Stripe] Subscription created for org ${organizationId}: ${planTier}`);
}

/**
 * Handle subscription updates (plan changes, status changes)
 */
export async function handleSubscriptionUpdated(subscription: any) {
  const organizationId = parseInt(subscription.metadata.organizationId);
  const planTier = subscription.metadata.planTier as 'starter' | 'enterprise';
  const plan = getPlanByTier(planTier);
  
  // Extract dates from subscription items (same as handleSubscriptionCreated)
  const subscriptionItem = subscription.items?.data?.[0];
  const billingCycleStart = new Date((subscriptionItem?.current_period_start || 0) * 1000);
  const billingCycleEnd = new Date((subscriptionItem?.current_period_end || 0) * 1000);
  
  await updateOrganizationSubscription({
    organizationId,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    planTier: planTier,
    subscriptionStatus: subscription.status,
    monthlyJobLimit: plan.features.monthlyJobLimit,
    maxAdminUsers: plan.features.maxAdminUsers,
    billingCycleStart,
    billingCycleEnd,
  });
  
  console.log(`[Stripe] Subscription updated for org ${organizationId}: ${subscription.status}`);
}

/**
 * Handle subscription deletion/cancellation
 */
export async function handleSubscriptionDeleted(subscription: any) {
  const organizationId = parseInt(subscription.metadata.organizationId);
  
  await updateOrganizationSubscription({
    organizationId,
    subscriptionStatus: 'canceled',
    // Keep the subscription IDs for reference
  });
  
  console.log(`[Stripe] Subscription canceled for org ${organizationId}`);
}

