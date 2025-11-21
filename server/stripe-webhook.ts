/**
 * Stripe Webhook Handler
 * 
 * Handles all Stripe events to keep subscriptions synchronized with database.
 * Critical for maintaining accurate billing state.
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { STRIPE_CONFIG, SUBSCRIPTION_PLANS } from './stripe-config';
import { updateOrganizationSubscription } from './db';

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-11-17.clover',
});

/**
 * Process Stripe webhook events
 * MUST verify signature before processing
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Webhook] Missing stripe-signature header');
    return res.status(400).send('Missing signature');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature to prevent spoofing
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    const error = err as Error;
    console.error('[Webhook] Signature verification failed:', error.message);
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }

  console.log('[Webhook] Received event:', event.type, 'ID:', event.id);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    // Always return 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    // Still return 200 to prevent Stripe from retrying
    // Log error for manual investigation
    res.json({ received: true, error: 'Processing failed' });
  }
}

/**
 * Handle checkout.session.completed event
 * This fires immediately when checkout completes
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Processing checkout.session.completed:', session.id);

  const organizationId = session.metadata?.organizationId;
  
  if (!organizationId) {
    console.error('[Webhook] Missing organizationId in checkout session metadata');
    return;
  }

  // Get the subscription ID from the session
  const subscriptionId = session.subscription as string;
  
  if (!subscriptionId) {
    console.error('[Webhook] No subscription found in checkout session');
    return;
  }

  // Retrieve the full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Process the subscription
  await handleSubscriptionCreated(subscription);
  
  console.log('[Webhook] Checkout completed successfully for org:', organizationId);
}

/**
 * Handle subscription.created event
 * This fires when a customer completes checkout
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing subscription.created:', subscription.id);

  const customerId = subscription.customer as string;
  const organizationId = subscription.metadata.organizationId;

  if (!organizationId) {
    console.error('[Webhook] Missing organizationId in subscription metadata');
    return;
  }

  // Determine plan tier from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let planTier: 'trial' | 'starter' | 'enterprise' = 'trial';
  let monthlyJobLimit = 50;
  let maxAdminUsers = 1;

  if (priceId === SUBSCRIPTION_PLANS.starter.priceId) {
    planTier = 'starter';
    monthlyJobLimit = 100;
    maxAdminUsers = 3;
  } else if (priceId === SUBSCRIPTION_PLANS.enterprise.priceId) {
    planTier = 'enterprise';
    monthlyJobLimit = -1; // unlimited
    maxAdminUsers = -1; // unlimited
  }

  // Calculate billing cycle dates
  const sub = subscription as any;
  const billingCycleStart = new Date((sub.current_period_start || 0) * 1000);
  const billingCycleEnd = new Date((sub.current_period_end || 0) * 1000);

  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    planTier,
    monthlyJobLimit,
    maxAdminUsers,
    billingCycleStart,
    billingCycleEnd,
  });

  console.log('[Webhook] Subscription created successfully for org:', organizationId);
}

/**
 * Handle subscription.updated event
 * This fires when subscription changes (upgrade, downgrade, renewal)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing subscription.updated:', subscription.id);

  const organizationId = subscription.metadata.organizationId;

  if (!organizationId) {
    console.error('[Webhook] Missing organizationId in subscription metadata');
    return;
  }

  // Determine plan tier from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let planTier: 'trial' | 'starter' | 'enterprise' = 'trial';
  let monthlyJobLimit = 50;
  let maxAdminUsers = 1;

  if (priceId === SUBSCRIPTION_PLANS.starter.priceId) {
    planTier = 'starter';
    monthlyJobLimit = 100;
    maxAdminUsers = 3;
  } else if (priceId === SUBSCRIPTION_PLANS.enterprise.priceId) {
    planTier = 'enterprise';
    monthlyJobLimit = -1; // unlimited
    maxAdminUsers = -1; // unlimited
  }

  // Calculate billing cycle dates
  const sub = subscription as any;
  const billingCycleStart = new Date((sub.current_period_start || 0) * 1000);
  const billingCycleEnd = new Date((sub.current_period_end || 0) * 1000);

  // Update billing cycle dates - job count will be calculated dynamically based on these dates
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    subscriptionStatus: subscription.status,
    planTier,
    monthlyJobLimit,
    maxAdminUsers,
    billingCycleStart,
    billingCycleEnd,
  });

  console.log('[Webhook] Subscription updated successfully for org:', organizationId);
}

/**
 * Handle subscription.deleted event
 * This fires when subscription is cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing subscription.deleted:', subscription.id);

  const organizationId = subscription.metadata.organizationId;

  if (!organizationId) {
    console.error('[Webhook] Missing organizationId in subscription metadata');
    return;
  }

  // Revert organization to trial plan (keep active)
  const { getDb } = await import('./db');
  const { organizations } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  
  const db = await getDb();
  if (db) {
    await db.update(organizations)
      .set({
        isActive: true, // Keep organization active
        subscriptionStatus: 'canceled',
        planTier: 'trial',
        monthlyJobLimit: 50,
        maxAdminUsers: 1,
        stripeSubscriptionId: null, // Clear Stripe subscription ID
      })
      .where(eq(organizations.id, parseInt(organizationId)));
  }

  console.log('[Webhook] Subscription cancelled, organization reverted to trial:', organizationId);
}

/**
 * Handle invoice.payment_succeeded event
 * This fires when payment is successful
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[Webhook] Processing invoice.payment_succeeded:', invoice.id);

  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) {
    console.log('[Webhook] Invoice not associated with subscription');
    return;
  }

  // Fetch subscription to get organizationId
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const organizationId = subscription.metadata.organizationId;

  if (!organizationId) {
    console.error('[Webhook] Missing organizationId in subscription metadata');
    return;
  }

  // Update subscription status to active
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    subscriptionStatus: 'active',
  });

  console.log('[Webhook] Payment succeeded for org:', organizationId);
}

/**
 * Handle invoice.payment_failed event
 * This fires when payment fails
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Webhook] Processing invoice.payment_failed:', invoice.id);

  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) {
    console.log('[Webhook] Invoice not associated with subscription');
    return;
  }

  // Fetch subscription to get organizationId
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const organizationId = subscription.metadata.organizationId;

  if (!organizationId) {
    console.error('[Webhook] Missing organizationId in subscription metadata');
    return;
  }

  // Update subscription status to past_due
  await updateOrganizationSubscription({
    organizationId: parseInt(organizationId),
    subscriptionStatus: 'past_due',
  });

  console.log('[Webhook] Payment failed for org:', organizationId);
  // TODO: Send email notification to admin
}

