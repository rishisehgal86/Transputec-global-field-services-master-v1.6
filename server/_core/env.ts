export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // SSO Configuration
  authPortalUrl: process.env.AUTH_PORTAL_URL ?? "https://3000-il4ahti3lfk3qfuyc26jq-28d25cb8.manusvm.computer",
  authValidationEndpoint: process.env.AUTH_VALIDATION_ENDPOINT ?? "https://3000-il4ahti3lfk3qfuyc26jq-28d25cb8.manusvm.computer/api/trpc/validation.validateToken",
  portalUrl: process.env.PORTAL_URL ?? "https://3000-il4ahti3lfk3qfuyc26jq-28d25cb8.manusvm.computer/portal",
  loginUrl: process.env.LOGIN_URL ?? "https://3000-il4ahti3lfk3qfuyc26jq-28d25cb8.manusvm.computer/login",
};
