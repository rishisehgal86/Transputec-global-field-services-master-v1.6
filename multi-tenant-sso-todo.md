# Multi-Tenancy and SSO Integration TODO

## Phase 1: Database Schema Updates

- [x] Add organizations table to schema
- [x] Add organizationId to jobs table
- [x] Add organizationId to users table
- [x] Add organizationId to engineers table (if exists)
- [x] Run database migration
- [x] Create default organization (FieldPulse)
- [x] Create admin user with organizationId

## Phase 2: JWT Validation Middleware

- [ ] Create JWT validation middleware
- [ ] Add JWT secret configuration
- [ ] Extract organizationId from JWT token
- [ ] Add organization context to request

## Phase 3: Query Updates

- [ ] Update all job queries to filter by organizationId
- [ ] Update user queries to filter by organizationId
- [ ] Update engineer queries to filter by organizationId
- [ ] Add organization checks to all mutations

## Phase 4: SSO Integration

- [ ] Add SSO login redirect endpoint
- [ ] Create token exchange handler
- [ ] Add logout with SSO callback
- [ ] Store JWT token in session

## Phase 5: UI Updates

- [ ] Show organization name in header
- [ ] Add organization switcher (if user has multiple orgs)
- [ ] Display trial status banner
- [ ] Update admin dashboard with org info

## Phase 6: Testing

- [ ] Test data isolation between organizations
- [ ] Test JWT token validation
- [ ] Test SSO login flow (mock)
- [ ] Save checkpoint

