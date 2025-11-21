/**
 * Webhook Middleware
 * 
 * Registers Stripe webhook endpoint with raw body parsing
 * Must be registered BEFORE JSON body parser
 */

import { Express, Request, Response, NextFunction } from 'express';
import { handleStripeWebhook } from '../stripe-webhook';

export function registerWebhookEndpoint(app: Express) {
  // Stripe webhooks need raw body for signature verification
  // This endpoint must be registered BEFORE the JSON body parser middleware
  
  // Custom middleware to capture raw body
  const captureRawBody = (req: Request, res: Response, next: NextFunction) => {
    let data = Buffer.from('');
    
    req.on('data', (chunk: Buffer) => {
      data = Buffer.concat([data, chunk]);
    });
    
    req.on('end', () => {
      req.body = data;
      next();
    });
    
    req.on('error', (err) => {
      console.error('[Webhook] Error reading request body:', err);
      res.status(400).send('Error reading request body');
    });
  };
  
  app.post(
    '/api/stripe/webhook',
    captureRawBody,
    handleStripeWebhook
  );

  console.log('[Webhook] Stripe webhook endpoint registered at /api/stripe/webhook');
}

