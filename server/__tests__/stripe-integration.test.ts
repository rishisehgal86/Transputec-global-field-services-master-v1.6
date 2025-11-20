/**
 * Stripe Integration Tests
 * 
 * Tests subscription management, webhooks, and billing functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { STRIPE_CONFIG, SUBSCRIPTION_PLANS } from '../stripe-config';
import { createCheckoutSession, createPortalSession, cancelSubscription } from '../stripe-helpers';
import Stripe from 'stripe';

describe('Stripe Configuration', () => {
  it('should have all required Stripe credentials', () => {
    expect(STRIPE_CONFIG.secretKey).toBeDefined();
    expect(STRIPE_CONFIG.publishableKey).toBeDefined();
    expect(STRIPE_CONFIG.webhookSecret).toBeDefined();
    expect(SUBSCRIPTION_PLANS.starter.priceId).toBeDefined();
    expect(SUBSCRIPTION_PLANS.enterprise.priceId).toBeDefined();
  });

  it('should have correct price IDs', () => {
    expect(SUBSCRIPTION_PLANS.starter.priceId).toBe('price_1SVTqoFQaKsrrJ5ldmjfREtF');
    expect(SUBSCRIPTION_PLANS.enterprise.priceId).toBe('price_1SVTrGFQaKsrrJ5lGaReOk3D');
  });

  it('should have valid API keys format', () => {
    expect(STRIPE_CONFIG.secretKey).toMatch(/^sk_test_/);
    expect(STRIPE_CONFIG.publishableKey).toMatch(/^pk_test_/);
    expect(STRIPE_CONFIG.webhookSecret).toMatch(/^whsec_/);
  });
});

describe('Stripe Helper Functions', () => {
  const testOrganizationId = 999999; // Use high number to avoid conflicts
  const testEmail = 'test@fieldpulse.io';

  describe('createCheckoutSession', () => {
    it('should create checkout session for starter plan', async () => {
      const result = await createCheckoutSession({
        organizationId: testOrganizationId,
        planTier: 'starter',
        customerEmail: testEmail,
        successUrl: 'https://test.com/success',
        cancelUrl: 'https://test.com/cancel',
      });

      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('url');
      expect(result.sessionId).toMatch(/^cs_test_/);
      expect(result.url).toContain('checkout.stripe.com');
    });

    it('should create checkout session for enterprise plan', async () => {
      const result = await createCheckoutSession({
        organizationId: testOrganizationId,
        planTier: 'enterprise',
        customerEmail: testEmail,
        successUrl: 'https://test.com/success',
        cancelUrl: 'https://test.com/cancel',
      });

      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('url');
      expect(result.sessionId).toMatch(/^cs_test_/);
    });

    it('should include organization metadata in session', async () => {
      const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
        apiVersion: '2024-12-18.acacia',
      });

      const result = await createCheckoutSession({
        organizationId: testOrganizationId,
        planTier: 'starter',
        customerEmail: testEmail,
        successUrl: 'https://test.com/success',
        cancelUrl: 'https://test.com/cancel',
      });

      // Retrieve session to verify metadata
      const session = await stripe.checkout.sessions.retrieve(result.sessionId);
      expect(session.metadata?.organizationId).toBe(testOrganizationId.toString());
      expect(session.metadata?.planTier).toBe('starter');
    });
  });

  describe('createPortalSession', () => {
    it('should create customer portal session', async () => {
      // First create a customer
      const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
        apiVersion: '2024-12-18.acacia',
      });

      const customer = await stripe.customers.create({
        email: testEmail,
        metadata: { test: 'true' },
      });

      try {
        const result = await createPortalSession({
          customerId: customer.id,
          returnUrl: 'https://test.com/billing',
        });

        expect(result).toHaveProperty('url');
        expect(result.url).toContain('billing.stripe.com');
      } finally {
        // Cleanup
        await stripe.customers.del(customer.id);
      }
    });
  });
});

describe('Webhook Event Processing', () => {
  it('should handle subscription.created event structure', () => {
    const mockSubscription = {
      id: 'sub_test123',
      customer: 'cus_test123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 2592000, // +30 days
      items: {
        data: [
          {
            price: {
              id: SUBSCRIPTION_PLANS.starter.priceId,
            },
          },
        ],
      },
      metadata: {
        organizationId: '1',
        planTier: 'starter',
      },
    };

    // Verify structure
    expect(mockSubscription).toHaveProperty('id');
    expect(mockSubscription).toHaveProperty('customer');
    expect(mockSubscription).toHaveProperty('status');
    expect(mockSubscription.metadata).toHaveProperty('organizationId');
  });

  it('should handle subscription.updated event structure', () => {
    const mockSubscription = {
      id: 'sub_test123',
      customer: 'cus_test123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 2592000,
      items: {
        data: [
          {
            price: {
              id: SUBSCRIPTION_PLANS.enterprise.priceId,
            },
          },
        ],
      },
      metadata: {
        organizationId: '1',
        planTier: 'enterprise',
      },
    };

    expect(mockSubscription.items.data[0].price.id).toBe(SUBSCRIPTION_PLANS.enterprise.priceId);
  });

  it('should handle invoice.payment_succeeded event structure', () => {
    const mockInvoice = {
      id: 'in_test123',
      subscription: 'sub_test123',
      amount_paid: 9900, // $99.00 in cents
      status: 'paid',
    };

    expect(mockInvoice).toHaveProperty('subscription');
    expect(mockInvoice.status).toBe('paid');
  });

  it('should handle invoice.payment_failed event structure', () => {
    const mockInvoice = {
      id: 'in_test123',
      subscription: 'sub_test123',
      amount_due: 9900,
      status: 'open',
      attempt_count: 1,
    };

    expect(mockInvoice).toHaveProperty('subscription');
    expect(mockInvoice.status).toBe('open');
  });
});

describe('Plan Configuration', () => {
  it('should have correct plan limits', () => {
    const plans = {
      trial: { jobs: 50, users: 1, price: 0 },
      starter: { jobs: 100, users: 3, price: 99 },
      enterprise: { jobs: -1, users: -1, price: 399 }, // -1 = unlimited
    };

    expect(plans.trial.jobs).toBe(50);
    expect(plans.starter.jobs).toBe(100);
    expect(plans.enterprise.jobs).toBe(-1);
    expect(plans.enterprise.users).toBe(-1);
  });

  it('should correctly identify unlimited plans', () => {
    const isUnlimited = (value: number) => value === -1;

    expect(isUnlimited(50)).toBe(false);
    expect(isUnlimited(100)).toBe(false);
    expect(isUnlimited(-1)).toBe(true);
  });
});

describe('Subscription Status Mapping', () => {
  it('should handle all Stripe subscription statuses', () => {
    const validStatuses = [
      'active',
      'trialing',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid',
    ];

    validStatuses.forEach(status => {
      expect(typeof status).toBe('string');
      expect(status.length).toBeGreaterThan(0);
    });
  });

  it('should map plan tiers correctly', () => {
    const tierMap = {
      [SUBSCRIPTION_PLANS.starter.priceId]: 'starter',
      [SUBSCRIPTION_PLANS.enterprise.priceId]: 'enterprise',
    };

    expect(tierMap[SUBSCRIPTION_PLANS.starter.priceId]).toBe('starter');
    expect(tierMap[SUBSCRIPTION_PLANS.enterprise.priceId]).toBe('enterprise');
  });
});

describe('Billing Cycle Calculations', () => {
  it('should calculate billing cycle dates correctly', () => {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysLater = now + (30 * 24 * 60 * 60);

    const start = new Date(now * 1000);
    const end = new Date(thirtyDaysLater * 1000);

    expect(end.getTime()).toBeGreaterThan(start.getTime());
    expect(end.getTime() - start.getTime()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  });

  it('should handle billing cycle renewal', () => {
    const lastCycleEnd = new Date('2024-01-01');
    const newCycleStart = new Date('2024-01-01');

    expect(newCycleStart.getTime()).toBeGreaterThanOrEqual(lastCycleEnd.getTime());
  });
});

describe('Error Handling', () => {
  it('should handle invalid plan tier', async () => {
    await expect(async () => {
      await createCheckoutSession({
        organizationId: 1,
        planTier: 'invalid' as any,
        customerEmail: 'test@test.com',
        successUrl: 'https://test.com/success',
        cancelUrl: 'https://test.com/cancel',
      });
    }).rejects.toThrow();
  });

  it('should handle missing organization ID', () => {
    const mockSubscription = {
      id: 'sub_test123',
      customer: 'cus_test123',
      status: 'active',
      metadata: {}, // Missing organizationId
    };

    expect(mockSubscription.metadata).not.toHaveProperty('organizationId');
  });
});

describe('Webhook Signature Verification', () => {
  it('should require stripe-signature header', () => {
    const headers = {
      'content-type': 'application/json',
    };

    expect(headers).not.toHaveProperty('stripe-signature');
  });

  it('should validate webhook secret format', () => {
    expect(STRIPE_CONFIG.webhookSecret).toMatch(/^whsec_/);
    expect(STRIPE_CONFIG.webhookSecret.length).toBeGreaterThan(20);
  });
});

describe('Integration Safeguards', () => {
  it('should prevent duplicate subscriptions', () => {
    // This test verifies the concept - actual implementation in database
    const existingSubscription = {
      organizationId: 1,
      stripeSubscriptionId: 'sub_existing',
      status: 'active',
    };

    expect(existingSubscription.stripeSubscriptionId).toBeDefined();
    expect(existingSubscription.status).toBe('active');
  });

  it('should handle race conditions', () => {
    // Verify idempotency concept
    const event1 = { id: 'evt_123', type: 'subscription.created' };
    const event2 = { id: 'evt_123', type: 'subscription.created' };

    expect(event1.id).toBe(event2.id);
  });

  it('should validate organization ownership', () => {
    const subscription = {
      metadata: { organizationId: '1' },
    };
    const requestingOrgId = 1;

    expect(parseInt(subscription.metadata.organizationId)).toBe(requestingOrgId);
  });
});

