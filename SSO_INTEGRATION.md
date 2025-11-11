# FieldPulse Go - SSO Integration Documentation

## Overview

FieldPulse Go has been successfully integrated with the centralized **FieldPulse Auth Portal** for Single Sign-On (SSO) authentication. This document describes the integration architecture, configuration, and usage.

---

## Architecture

### Authentication Flow

1. **User Access**: User navigates to FieldPulse Go URL
2. **Authentication Check**: Application checks for existing session
3. **SSO Redirect**: If not authenticated, redirects to FieldPulse Auth Portal login
4. **User Login**: User authenticates at auth portal
5. **Token Generation**: Auth portal generates JWT token with user + organization data
6. **App Launch**: Portal redirects to FieldPulse Go with token in URL: `https://go.fieldpulse.com/?token=...`
7. **Token Validation**: FieldPulse Go validates token and creates session
8. **Access Granted**: User is authenticated and can access the application

### Multi-Tenant Architecture

- Each JWT token contains `organizationId` from the auth portal
- All database queries automatically filter by `organizationId`
- Complete data isolation between organizations
- Users can only access data from their own organization

---

## Configuration

### Environment Variables

The following environment variables must be configured in the Management UI → Settings → Secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_PORTAL_URL` | Base URL of the auth portal | `https://auth.field-pulse.io` |
| `AUTH_VALIDATION_ENDPOINT` | Token validation endpoint | `https://auth.field-pulse.io/api/trpc/validation.validateToken` |
| `PORTAL_URL` | Portal dashboard URL (for logout redirect) | `https://auth.field-pulse.io/portal` |
| `LOGIN_URL` | Login page URL (for authentication) | `https://auth.field-pulse.io/login` |
| `JWT_SECRET` | JWT signing secret (MUST match auth portal) | `i3C7b8VuoxfPNmTPNRt2XQ` |

**Critical**: The `JWT_SECRET` must be identical to the auth portal's secret for token validation to work.

### Client Environment Variables

Add these to your `.env` or deployment configuration:

```env
VITE_PORTAL_URL=https://auth.field-pulse.io/portal
VITE_LOGIN_URL=https://auth.field-pulse.io/login
```

---

## Technical Implementation

### Server-Side Components

#### 1. SSO Authentication Utility (`server/sso-auth.ts`)

Provides token validation functions:

- `validateTokenLocal(token)` - Fast local JWT validation
- `validateTokenRemote(token)` - Remote validation via auth portal API
- `extractUserFromToken(payload)` - Extract user data from token

#### 2. JWT Middleware (`server/_core/sdk.ts`)

Updated `authenticateRequest()` method:

1. Extracts session cookie
2. Attempts SSO token validation first
3. Falls back to local authentication (backwards compatibility)
4. Returns user object with `organizationId`

#### 3. Validation Endpoint (`server/routers.ts`)

New `auth.validateSSOToken` mutation:

- Accepts JWT token from URL
- Validates token locally
- Creates session cookie
- Returns user data with organizationId

### Client-Side Components

#### 1. SSO Client Utility (`client/src/lib/sso-client.ts`)

Handles client-side SSO flow:

- `extractTokenFromURL()` - Get token from query parameter
- `removeTokenFromURL()` - Remove token for security
- `createSession()` - Store session in localStorage
- `getSession()` - Retrieve current session
- `logout()` - Clear session and redirect to portal

#### 2. Updated useAuth Hook (`client/src/_core/hooks/useAuth.ts`)

Enhanced authentication hook:

- Checks for existing session on mount
- Extracts and validates SSO token from URL
- Calls backend validation endpoint
- Creates local session
- Redirects to login if not authenticated
- Supports `redirectOnUnauthenticated` option

---

## Usage

### Protecting Admin Routes

All admin pages now use SSO authentication:

```typescript
export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth({ 
    redirectOnUnauthenticated: true 
  });

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return null; // useAuth handles redirect
  }

  // Render admin content
}
```

### Logout Functionality

Logout now redirects to the portal:

```typescript
const { logout } = useAuth();

// Clicking logout button
<Button onClick={logout}>Logout</Button>

// This will:
// 1. Clear local session
// 2. Clear session cookie
// 3. Redirect to portal dashboard
```

### Accessing Organization Data

User object now includes `organizationId`:

```typescript
const { user } = useAuth();

console.log(user.organizationId); // Organization ID from JWT token
console.log(user.email); // User email
console.log(user.role); // User role (admin/user)
```

---

## Database Schema

### Multi-Tenant Tables

All tables include `organizationId` for data isolation:

```sql
-- Example: jobs table
CREATE TABLE jobs (
  id INT PRIMARY KEY,
  organizationId INT NOT NULL,
  -- other fields...
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);
```

### Automatic Filtering

All database queries automatically filter by `organizationId`:

```typescript
// Server-side query helper
export async function getJobsByOrganization(organizationId: number) {
  const db = await getDb();
  return db.select()
    .from(jobs)
    .where(eq(jobs.organizationId, organizationId));
}
```

---

## Security Considerations

### Token Security

- ✅ JWT tokens are validated on every request
- ✅ Tokens are removed from URL after extraction
- ✅ Tokens expire after 1 hour (configured in auth portal)
- ✅ Session cookies are httpOnly and secure in production

### Data Isolation

- ✅ All queries filter by `organizationId`
- ✅ Users cannot access other organizations' data
- ✅ Organization ID is extracted from validated JWT token
- ✅ No way to spoof or modify organization ID

### Best Practices

1. **Never commit JWT_SECRET** to version control
2. **Use HTTPS** in production for secure token transmission
3. **Validate tokens server-side** for all sensitive operations
4. **Implement session expiry** and refresh mechanisms
5. **Monitor failed authentication attempts**

---

## Testing SSO Integration

### Manual Testing Steps

1. **Clear Browser Data**
   - Clear cookies and localStorage
   - Open incognito/private window

2. **Access FieldPulse Go**
   - Navigate to: `https://go.field-pulse.io/admin`
   - Should redirect to auth portal login

3. **Login at Auth Portal**
   - Enter credentials at auth portal
   - Click "Launch FieldPulse Go"

4. **Token Validation**
   - Should redirect back with token in URL
   - Token should be validated automatically
   - URL should be cleaned (token removed)
   - Should see admin dashboard

5. **Test Data Isolation**
   - Create jobs, engineers, clients
   - Login as different organization
   - Verify data is isolated

6. **Test Logout**
   - Click logout button
   - Should redirect to portal dashboard
   - Session should be cleared

### Automated Testing

```bash
# Test token validation endpoint
curl -X POST https://go.field-pulse.io/api/trpc/auth.validateSSOToken \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_JWT_TOKEN_HERE"}'

# Expected response:
# {
#   "success": true,
#   "user": {
#     "id": 1,
#     "email": "user@example.com",
#     "name": "User Name",
#     "role": "admin",
#     "organizationId": 1
#   }
# }
```

---

## Troubleshooting

### Issue: "Invalid or expired token"

**Cause**: JWT_SECRET mismatch or expired token

**Solution**:
1. Verify JWT_SECRET matches auth portal exactly
2. Check token expiration time (default 1 hour)
3. Try logging in again to get fresh token

### Issue: Infinite redirect loop

**Cause**: Session not being created properly

**Solution**:
1. Clear browser cookies and localStorage
2. Check browser console for errors
3. Verify validation endpoint is accessible
4. Check network tab for failed requests

### Issue: "User not found" or "Organization not found"

**Cause**: Token contains invalid user/organization ID

**Solution**:
1. Verify user exists in auth portal database
2. Check organization is active
3. Ensure database sync between systems

### Issue: Can see other organizations' data

**Cause**: organizationId filtering not working

**Solution**:
1. Check all database queries include organizationId filter
2. Verify JWT token contains correct organizationId
3. Review server logs for query errors

---

## Deployment Checklist

### Pre-Deployment

- [ ] Auth portal is deployed and accessible
- [ ] JWT_SECRET is configured in both systems
- [ ] Environment variables are set correctly
- [ ] Database migrations are complete
- [ ] HTTPS is enabled on both domains

### Deployment

- [ ] Deploy FieldPulse Go application
- [ ] Update environment variables with production URLs
- [ ] Configure CORS if needed
- [ ] Test SSO flow end-to-end
- [ ] Verify data isolation between organizations

### Post-Deployment

- [ ] Monitor authentication logs
- [ ] Test with multiple organizations
- [ ] Verify logout functionality
- [ ] Check session expiry behavior
- [ ] Document any issues or edge cases

---

## Support

For issues or questions about SSO integration:

1. Check this documentation first
2. Review server logs for authentication errors
3. Test with auth portal team for token issues
4. Contact FieldPulse development team

---

## Version History

### Version 5.0 (Current)
- Initial SSO integration with FieldPulse Auth Portal
- Multi-tenant architecture with organizationId
- JWT-based authentication
- Removed local login system
- Session management with localStorage

---

**Last Updated**: November 11, 2025  
**Integration Status**: ✅ Complete and Ready for Testing

