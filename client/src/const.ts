export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/fieldpulse-go-logo-universal.png";

// SSO Configuration
export const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://3000-il4ahti3lfk3qfuyc26jq-28d25cb8.manusvm.computer/portal";
export const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || "https://3000-il4ahti3lfk3qfuyc26jq-28d25cb8.manusvm.computer/login";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};