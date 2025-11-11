# SSO Integration TODO

## Phase 1: Analysis ✅
- [x] Extract and review integration package
- [x] Understand SSO authentication flow
- [x] Identify configuration requirements
- [x] Create task plan

## Phase 2: Configuration
- [ ] Add environment variables for auth portal URLs
- [ ] Update JWT_SECRET to match auth portal
- [ ] Install jsonwebtoken package
- [ ] Install @types/jsonwebtoken package

## Phase 3: Server-Side Implementation
- [ ] Copy sso-auth.ts utility to server directory
- [ ] Update JWT middleware to validate SSO tokens
- [ ] Create SSO callback handler endpoint
- [ ] Update context.ts to extract user from SSO session
- [ ] Update all protected procedures to use organizationId from token
- [ ] Remove local password authentication logic

## Phase 4: Frontend Implementation
- [ ] Create SSO authentication hook (useAuth replacement)
- [ ] Implement token extraction from URL
- [ ] Create session management with localStorage
- [ ] Add loading states for SSO authentication
- [ ] Update logout to redirect to portal

## Phase 5: Cleanup
- [ ] Remove Login.tsx page
- [ ] Remove local auth endpoints (login, register, changePassword)
- [ ] Remove password field from users table
- [ ] Update all routes to use SSO authentication
- [ ] Remove UserManagement page (managed in auth portal)

## Phase 6: Testing
- [ ] Test SSO login flow from auth portal
- [ ] Test token validation
- [ ] Test organizationId extraction
- [ ] Test data isolation between organizations
- [ ] Test logout and redirect to portal
- [ ] Test expired token handling
- [ ] Test invalid token handling

## Phase 7: Documentation
- [ ] Update README with SSO integration details
- [ ] Document environment variables
- [ ] Create deployment guide for SSO setup
- [ ] Update hosting documentation

