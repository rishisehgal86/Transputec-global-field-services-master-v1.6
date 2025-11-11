/**
 * FieldPulse Go - SSO Authentication Utility
 * 
 * This module provides functions to validate SSO tokens from the FieldPulse Auth Portal
 * and manage user sessions in FieldPulse Go.
 */

import jwt from 'jsonwebtoken';
import { ENV } from './_core/env';

// =============================================================================
// Types
// =============================================================================

export interface SSOTokenPayload {
  userId: number;
  email: string;
  name?: string;
  organizationId: number;
  role: string;
  iat: number;
  exp: number;
}

export interface ValidationResponse {
  valid: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  organization?: {
    id: number;
    name: string;
    slug: string;
  };
  error?: string;
}

// =============================================================================
// Token Validation Functions
// =============================================================================

/**
 * Validate SSO token locally using JWT secret
 * Fast but doesn't check if user/org still exists in database
 */
export function validateTokenLocal(token: string): SSOTokenPayload | null {
  try {
    const decoded = jwt.verify(token, ENV.jwtSecret) as SSOTokenPayload;
    return decoded;
  } catch (error) {
    console.error('[SSO] Token validation failed:', error);
    return null;
  }
}

/**
 * Validate SSO token via Auth Portal API
 * Slower but ensures user/org still exists and is active
 * Recommended for production use
 */
export async function validateTokenRemote(token: string): Promise<ValidationResponse> {
  try {
    const response = await fetch(ENV.authValidationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `Validation request failed: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.result?.data) {
      return {
        valid: true,
        user: data.result.data.user,
        organization: data.result.data.organization,
      };
    }

    return {
      valid: false,
      error: data.error?.message || 'Invalid token',
    };
  } catch (error) {
    console.error('[SSO] Remote validation failed:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract user and organization info from validated token
 */
export function extractUserFromToken(payload: SSOTokenPayload) {
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name || payload.email,
    role: payload.role,
    organizationId: payload.organizationId,
  };
}

