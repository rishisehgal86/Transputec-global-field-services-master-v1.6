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
    throw new Error('Failed to create checkout session');
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
 */
export async function handleSubscriptionCreated(subscription: any) {
  const organizationId = parseInt(subscription.metadata.organizationId);
  const planTier = subscription.metadata.planTier as 'starter' | 'enterprise';
  const plan = getPlanByTier(planTier);
  
  // Calculate billing cycle dates
  const billingCycleStart = new Date(subscription.current_period_start * 1000);
  const billingCycleEnd = new Date(subscription.current_period_end * 1000);
  
  await updateOrganizationSubscription({
    organizationId,
    stripeCustomerId: subscription.customer,
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
  
  const billingCycleStart = new Date(subscription.current_period_start * 1000);
  const billingCycleEnd = new Date(subscription.current_period_end * 1000);
  
  await updateOrganizationSubscription({
    organizationId,
    stripeCustomerId: subscription.customer,
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

