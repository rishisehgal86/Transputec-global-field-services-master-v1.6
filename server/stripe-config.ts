import Stripe from 'stripe';

/**
 * Stripe Configuration - All values loaded from environment variables
 * NO hardcoded credentials or price IDs
 */

// Load and validate required environment variables
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Stripe API Configuration
export const STRIPE_CONFIG = {
  publishableKey: getRequiredEnv('STRIPE_PUBLISHABLE_KEY'),
  secretKey: getRequiredEnv('STRIPE_SECRET_KEY'),
  webhookSecret: getRequiredEnv('STRIPE_WEBHOOK_SECRET'),
};

// Log loaded configuration (without exposing secrets)
console.log('[Stripe] Configuration loaded:');
console.log(`[Stripe]   - Publishable Key: ${STRIPE_CONFIG.publishableKey.substring(0, 20)}...`);
console.log(`[Stripe]   - Secret Key: ${STRIPE_CONFIG.secretKey.substring(0, 20)}...`);
console.log(`[Stripe]   - Webhook Secret: ${STRIPE_CONFIG.webhookSecret.substring(0, 20)}...`);

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter Plan',
    priceId: getRequiredEnv('STRIPE_STARTER_PRICE_ID'),
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
    priceId: getRequiredEnv('STRIPE_ENTERPRISE_PRICE_ID'),
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

console.log('[Stripe] Price IDs loaded:');
console.log(`[Stripe]   - Starter: ${SUBSCRIPTION_PLANS.starter.priceId}`);
console.log(`[Stripe]   - Enterprise: ${SUBSCRIPTION_PLANS.enterprise.priceId}`);

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

console.log('[Stripe] ✅ Stripe client initialized successfully');

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

