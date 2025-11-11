import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * SSO JWT Token Structure (from fieldpulse-auth system)
 */
export interface SSOToken {
  userId: number;
  email: string;
  name: string;
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  role: string;
  appAccess: string[]; // ['fieldpulse-go', 'fieldpulse-core']
  iat: number; // issued at
  exp: number; // expiration
}

/**
 * JWT Secret for validating SSO tokens
 * In production, this should match the secret used by fieldpulse-auth
 * For now, using a placeholder that will be replaced when SSO is ready
 */
const SSO_JWT_SECRET = process.env.SSO_JWT_SECRET || 'fieldpulse-sso-secret-change-in-production';

/**
 * Validate JWT token from SSO system
 * Returns decoded token if valid, null if invalid
 */
export function validateSSOToken(token: string): SSOToken | null {
  try {
    const decoded = jwt.verify(token, SSO_JWT_SECRET) as SSOToken;
    
    // Verify the token includes required fields
    if (!decoded.userId || !decoded.organizationId || !decoded.appAccess) {
      console.error('[SSO] Invalid token structure:', decoded);
      return null;
    }
    
    // Verify user has access to FieldPulse Go
    if (!decoded.appAccess.includes('fieldpulse-go')) {
      console.error('[SSO] User does not have access to FieldPulse Go');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('[SSO] Token validation error:', error);
    return null;
  }
}

/**
 * Express middleware to validate SSO JWT token
 * Extracts token from Authorization header or cookie
 */
export function ssoAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Try to get token from Authorization header
  let token = req.headers.authorization?.replace('Bearer ', '');
  
  // If not in header, try cookie
  if (!token) {
    token = req.cookies?.sso_token;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }
  
  const decoded = validateSSOToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Attach decoded token to request for use in routes
  (req as any).ssoUser = decoded;
  
  next();
}

/**
 * Generate a JWT token (for testing purposes)
 * In production, only the SSO system should generate tokens
 */
export function generateTestToken(payload: Omit<SSOToken, 'iat' | 'exp'>): string {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    },
    SSO_JWT_SECRET
  );
}

