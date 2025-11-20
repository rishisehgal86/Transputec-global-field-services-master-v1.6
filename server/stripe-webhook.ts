/**
 * Stripe Webhook Handler
 * 
 * Handles all Stripe events to keep subscriptions synchronized with database.
 * Critical for maintaining accurate billing state.
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from './stripe-config';
import { updateOrganizationSubscription } from './db';

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-12-18.acacia',
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

  if (priceId === STRIPE_CONFIG.prices.starter) {
    planTier = 'starter';
    monthlyJobLimit = 100;
    maxAdminUsers = 3;
  } else if (priceId === STRIPE_CONFIG.prices.enterprise) {
    planTier = 'enterprise';
    monthlyJobLimit = -1; // unlimited
    maxAdminUsers = -1; // unlimited
  }

  // Calculate billing cycle dates
  const billingCycleStart = new Date(subscription.current_period_start * 1000);
  const billingCycleEnd = new Date(subscription.current_period_end * 1000);

  await updateOrganizationSubscription(parseInt(organizationId), {
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

  if (priceId === STRIPE_CONFIG.prices.starter) {
    planTier = 'starter';
    monthlyJobLimit = 100;
    maxAdminUsers = 3;
  } else if (priceId === STRIPE_CONFIG.prices.enterprise) {
    planTier = 'enterprise';
    monthlyJobLimit = -1; // unlimited
    maxAdminUsers = -1; // unlimited
  }

  // Calculate billing cycle dates
  const billingCycleStart = new Date(subscription.current_period_start * 1000);
  const billingCycleEnd = new Date(subscription.current_period_end * 1000);

  // Reset job count if new billing cycle
  // TODO: Fetch organization to check if we should reset count
  const shouldResetCount = false; // Will be handled by cron job

  await updateOrganizationSubscription(parseInt(organizationId), {
    subscriptionStatus: subscription.status,
    planTier,
    monthlyJobLimit,
    maxAdminUsers,
    billingCycleStart,
    billingCycleEnd,
    ...(shouldResetCount ? { currentMonthJobCount: 0 } : {}),
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

  // Downgrade to trial plan
  await updateOrganizationSubscription(parseInt(organizationId), {
    subscriptionStatus: 'canceled',
    planTier: 'trial',
    monthlyJobLimit: 50,
    maxAdminUsers: 1,
  });

  console.log('[Webhook] Subscription cancelled for org:', organizationId);
}

/**
 * Handle invoice.payment_succeeded event
 * This fires when payment is successful
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[Webhook] Processing invoice.payment_succeeded:', invoice.id);

  const subscriptionId = invoice.subscription as string;

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
  await updateOrganizationSubscription(parseInt(organizationId), {
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

  const subscriptionId = invoice.subscription as string;

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
  await updateOrganizationSubscription(parseInt(organizationId), {
    subscriptionStatus: 'past_due',
  });

  console.log('[Webhook] Payment failed for org:', organizationId);
  // TODO: Send email notification to admin
}

