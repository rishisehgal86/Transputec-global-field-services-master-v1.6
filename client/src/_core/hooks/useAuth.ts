import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  extractTokenFromURL,
  removeTokenFromURL,
  getSession,
  createSession,
  clearSession,
  redirectToLogin,
  logout as ssoLogout,
  type SSOSession,
} from "@/lib/sso-client";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const [ssoInitialized, setSsoInitialized] = useState(false);
  const utils = trpc.useUtils();

  const validateTokenMutation = trpc.auth.validateSSOToken.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: ssoInitialized, // Only query after SSO check
  });

  // SSO initialization
  useEffect(() => {
    async function initSSO() {
      try {
        // Check for existing session first
        const existingSession = getSession();
        if (existingSession) {
          console.log('[SSO] Found existing session');
          setSsoInitialized(true);
          return;
        }

        // Check for SSO token in URL
        const token = extractTokenFromURL();
        
        if (!token) {
          console.log('[SSO] No token found');
          if (redirectOnUnauthenticated) {
            redirectToLogin();
          }
          setSsoInitialized(true);
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
              name: '',
              slug: '',
            },
          };
          
          createSession(sessionData);
          setSsoInitialized(true);
        } else {
          console.error('[SSO] Token validation failed');
          if (redirectOnUnauthenticated) {
            redirectToLogin();
          }
          setSsoInitialized(true);
        }
      } catch (error) {
        console.error('[SSO] Authentication error:', error);
        clearSession();
        if (redirectOnUnauthenticated) {
          redirectToLogin();
        }
        setSsoInitialized(true);
      }
    }

    initSSO();
  }, [redirectOnUnauthenticated]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Ignore unauthorized errors on logout
      }
    } finally {
      clearSession();
      ssoLogout();
    }
  }, [logoutMutation]);

  const state = useMemo(() => {
    const session = getSession();
    const user = meQuery.data ?? (session ? session.user : null);
    
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );
    
    return {
      user,
      loading: !ssoInitialized || meQuery.isLoading || validateTokenMutation.isPending || logoutMutation.isPending,
      error: meQuery.error ?? validateTokenMutation.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    ssoInitialized,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    validateTokenMutation.isPending,
    validateTokenMutation.error,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
