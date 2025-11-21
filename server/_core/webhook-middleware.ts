/**
 * Webhook Middleware
 * 
 * Registers Stripe webhook endpoint with raw body parsing
 * Must be registered BEFORE JSON body parser
 */

import { Express, Request, Response } from 'express';
import { handleStripeWebhook } from '../stripe-webhook';

export function registerWebhookEndpoint(app: Express) {
  // Stripe webhooks need raw body for signature verification
  // This endpoint must be registered BEFORE the JSON body parser middleware
  app.post(
    '/api/stripe/webhook',
    // Use express.raw() to get the raw body as a Buffer
    require('express').raw({ type: 'application/json' }),
    handleStripeWebhook
  );

  console.log('[Webhook] Stripe webhook endpoint registered at /api/stripe/webhook');
}

