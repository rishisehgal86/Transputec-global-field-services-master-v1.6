import { describe, it, expect } from 'vitest';
import { stripe, SUBSCRIPTION_PLANS, getPlanByPriceId } from './stripe-config';

describe('Stripe Connection Test', () => {
  it('should connect to Stripe and retrieve account', async () => {
    const account = await stripe.accounts.retrieve();
    
    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    console.log('[Stripe] ✅ Connected to account:', account.id);
  });

  it('should verify Starter plan price exists', async () => {
    const price = await stripe.prices.retrieve(SUBSCRIPTION_PLANS.starter.priceId);
    
    expect(price).toBeDefined();
    expect(price.id).toBe(SUBSCRIPTION_PLANS.starter.priceId);
    expect(price.unit_amount).toBe(9900); // $99
    console.log('[Stripe] ✅ Starter Plan verified: $99/month');
  });

  it('should verify Enterprise plan price exists', async () => {
    const price = await stripe.prices.retrieve(SUBSCRIPTION_PLANS.enterprise.priceId);
    
    expect(price).toBeDefined();
    expect(price.id).toBe(SUBSCRIPTION_PLANS.enterprise.priceId);
    expect(price.unit_amount).toBe(39900); // $399
    console.log('[Stripe] ✅ Enterprise Plan verified: $399/month');
  });

  it('should correctly map price IDs to plans', () => {
    const starterPlan = getPlanByPriceId(SUBSCRIPTION_PLANS.starter.priceId);
    expect(starterPlan?.tier).toBe('starter');
    expect(starterPlan?.features.monthlyJobLimit).toBe(100);
    
    const enterprisePlan = getPlanByPriceId(SUBSCRIPTION_PLANS.enterprise.priceId);
    expect(enterprisePlan?.tier).toBe('enterprise');
    expect(enterprisePlan?.features.monthlyJobLimit).toBeNull();
    
    console.log('[Stripe] ✅ Plan mapping works correctly');
  });
});

