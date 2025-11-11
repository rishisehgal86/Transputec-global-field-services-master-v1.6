import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  extractTokenFromURL,
  removeTokenFromURL,
  getSession,
  createSession,
  clearSession,
  redirectToLogin,
  logout as ssoLogout,
  type SSOSession,
} from '@/lib/sso-client';

interface UseSSOAuthResult {
  user: SSOSession['user'] | null;
  organization: SSOSession['organization'] | null;
  authenticated: boolean;
  loading: boolean;
  logout: () => void;
}

/**
 * Hook for SSO authentication
 * Handles token validation and session management
 */
export function useSSOAuth(): UseSSOAuthResult {
  const [user, setUser] = useState<SSOSession['user'] | null>(null);
  const [organization, setOrganization] = useState<SSOSession['organization'] | null>(null);
  const [loading, setLoading] = useState(true);

  const validateTokenMutation = trpc.auth.validateSSOToken.useMutation();

  useEffect(() => {
    async function initAuth() {
      try {
        // Check for existing session first
        const existingSession = getSession();
        if (existingSession) {
          console.log('[SSO] Found existing session');
          setUser(existingSession.user);
          setOrganization(existingSession.organization);
          setLoading(false);
          return;
        }

        // Check for SSO token in URL
        const token = extractTokenFromURL();
        
        if (!token) {
          console.log('[SSO] No token found, redirecting to login');
          redirectToLogin();
          return;
        }

        console.log('[SSO] Token found in URL, validating...');
        
        // Remove token from URL for security
        removeTokenFromURL();

        // Validate token with backend
        const result = await validateTokenMutation.mutateAsync({ token });

        if (result.success && result.user) {
          console.log('[SSO] Token validated successfully');
          
          // Create session
          const sessionData: SSOSession = {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
            },
            organization: {
              id: result.user.organizationId,
              name: '', // Will be populated from backend if needed
              slug: '',
            },
          };
          
          createSession(sessionData);
          setUser(sessionData.user);
          setOrganization(sessionData.organization);
        } else {
          console.error('[SSO] Token validation failed');
          redirectToLogin();
        }
      } catch (error) {
        console.error('[SSO] Authentication error:', error);
        clearSession();
        redirectToLogin();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  return {
    user,
    organization,
    authenticated: !!user,
    loading,
    logout: ssoLogout,
  };
}

