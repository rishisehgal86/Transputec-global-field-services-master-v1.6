/**
 * FieldPulse Go - Client-Side SSO Utility
 * 
 * Handles SSO authentication flow on the client side
 */

import { PORTAL_URL, LOGIN_URL } from '@/const';

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  portalUrl: PORTAL_URL,
  loginUrl: LOGIN_URL,
};

// =============================================================================
// Types
// =============================================================================

export interface SSOSession {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  organization: {
    id: number;
    name: string;
    slug: string;
  };
}

// =============================================================================
// URL Token Handling
// =============================================================================

/**
 * Extract SSO token from URL query parameters
 */
export function extractTokenFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

/**
 * Remove token from URL after extraction (for security)
 */
export function removeTokenFromURL(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('token');
  window.history.replaceState({}, document.title, url.toString());
}

// =============================================================================
// Session Management
// =============================================================================

const SESSION_KEY = 'fieldpulse_go_session';

/**
 * Store user session data in localStorage
 */
export function createSession(userData: SSOSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  localStorage.setItem('fieldpulse_session_created', new Date().toISOString());
}

/**
 * Get current session data
 */
export function getSession(): SSOSession | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    return JSON.parse(session);
  } catch (error) {
    console.error('[SSO] Failed to get session:', error);
    return null;
  }
}

/**
 * Clear session data
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('fieldpulse_session_created');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// =============================================================================
// Navigation
// =============================================================================

/**
 * Redirect to auth portal for login
 */
export function redirectToLogin(): void {
  window.location.href = CONFIG.loginUrl;
}

/**
 * Redirect to portal dashboard
 */
export function redirectToPortal(): void {
  window.location.href = CONFIG.portalUrl;
}

/**
 * Logout and redirect to portal
 */
export function logout(): void {
  clearSession();
  redirectToPortal();
}

