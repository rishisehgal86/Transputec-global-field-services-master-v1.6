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
    // Use raw body parser for this specific endpoint
    (req: Request, res: Response, next) => {
      if (req.headers['content-type'] === 'application/json') {
        let data = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
          data += chunk;
        });
        req.on('end', () => {
          req.body = data;
          next();
        });
      } else {
        next();
      }
    },
    handleStripeWebhook
  );

  console.log('[Webhook] Stripe webhook endpoint registered at /api/stripe/webhook');
}

