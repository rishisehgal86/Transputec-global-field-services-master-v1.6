import Stripe from 'stripe';

/**
 * Stripe Configuration for FieldPulse Go
 * 
 * Account: Field Pulse Go sandbox (acct_1SVTpIJzUbfX1hA7)
 * Email: rishi@karrdservicesuae.com
 */

// Stripe API Keys
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51SVTpTFQaKsrrJ5lX4WM4HqzWm7x3RoAATGsYiBR06DoOs9cJVkR3hWsVqCBo5sGpyrjuLEoL4Km1F8gxn0wVKdy00MYjBuKOK',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_51SVTpTFQaKsrrJ5lrke9ZjzjkC1CvGe9XZQ1IUY7vxdcLBhEHjpdRcMIBhzlOl17QZb4zYPzDPHPw6vfiyo7kFTT00zoZ5qSA2',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Validate required Stripe configuration
if (!STRIPE_CONFIG.webhookSecret) {
  console.warn('[Stripe] WARNING: STRIPE_WEBHOOK_SECRET environment variable is not set. Webhook signature verification will fail.');
}

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter Plan',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    price: 99,
    currency: 'usd',
    interval: 'month',
    features: {
      monthlyJobLimit: 100,
      maxAdminUsers: 3,
      description: '100 jobs per month, 3 admin users, all features, email support',
    },
  },
  enterprise: {
    name: 'Enterprise Plan',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 399,
    currency: 'usd',
    interval: 'month',
    features: {
      monthlyJobLimit: null, // unlimited
      maxAdminUsers: 999, // unlimited
      description: 'Unlimited jobs, unlimited admin users, priority support, all features',
    },
  },
};

// Validate required price IDs
if (!SUBSCRIPTION_PLANS.starter.priceId) {
  console.warn('[Stripe] WARNING: STRIPE_STARTER_PRICE_ID environment variable is not set. Starter plan checkout will fail.');
}
if (!SUBSCRIPTION_PLANS.enterprise.priceId) {
  console.warn('[Stripe] WARNING: STRIPE_ENTERPRISE_PRICE_ID environment variable is not set. Enterprise plan checkout will fail.');
}

// Trial Configuration
export const TRIAL_CONFIG = {
  durationDays: 14,
  jobLimit: 50,
  maxAdminUsers: 999, // unlimited during trial
};

// Create Stripe client instance
export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

// Helper to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  if (priceId === SUBSCRIPTION_PLANS.starter.priceId) {
    return { tier: 'starter' as const, ...SUBSCRIPTION_PLANS.starter };
  }
  if (priceId === SUBSCRIPTION_PLANS.enterprise.priceId) {
    return { tier: 'enterprise' as const, ...SUBSCRIPTION_PLANS.enterprise };
  }
  return null;
}

// Helper to get plan by tier
export function getPlanByTier(tier: 'starter' | 'enterprise') {
  return SUBSCRIPTION_PLANS[tier];
}

