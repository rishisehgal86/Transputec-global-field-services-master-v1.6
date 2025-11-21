/**
 * Test endpoint to manually update subscription
 * FOR DEVELOPMENT ONLY - Remove in production
 */

import { Express } from 'express';
import { updateOrganizationSubscription } from './db';

export function registerTestSubscriptionEndpoint(app: Express) {
  // Only enable in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  app.post('/api/test/update-subscription', async (req, res) => {
    try {
      const { organizationId, planTier } = req.body;

      if (!organizationId || !planTier) {
        return res.status(400).json({ 
          error: 'Missing organizationId or planTier' 
        });
      }

      let monthlyJobLimit = 50;
      let maxAdminUsers = 1;

      if (planTier === 'starter') {
        monthlyJobLimit = 100;
        maxAdminUsers = 3;
      } else if (planTier === 'enterprise') {
        monthlyJobLimit = -1;
        maxAdminUsers = -1;
      }

      const now = new Date();
      const billingCycleEnd = new Date(now);
      billingCycleEnd.setMonth(billingCycleEnd.getMonth() + 1);

      await updateOrganizationSubscription({
        organizationId,
        planTier,
        monthlyJobLimit,
        maxAdminUsers,
        subscriptionStatus: 'active',
        billingCycleStart: now,
        billingCycleEnd,
      });

      res.json({ 
        success: true, 
        message: `Organization ${organizationId} updated to ${planTier} plan` 
      });
    } catch (error) {
      console.error('[Test] Failed to update subscription:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  });

  console.log('[Test] Subscription update endpoint registered at /api/test/update-subscription');
}

