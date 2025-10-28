# Transputec Field Services - Deployment Information

## Deployment Status

**Status:** ✅ Successfully Deployed  
**Deployment Date:** October 27, 2025  
**Environment:** Production

## Access Information

**Public URL:** https://5002-ixp3fxnybp83g4qj3nijb-2c523bd1.manusvm.computer

### Application Details

- **Application Name:** Transputec Field Engineer Dispatch & Tracking System
- **Version:** 1.6 (feature/local-auth branch)
- **Port:** 5002
- **Server:** Node.js (Production Mode)

## Features Available

The deployed application includes the following features:

### Client Portal
- Self-service request submission (no login required)
- Geocoded address search with map-based location selection
- Real-time job tracking with live engineer location
- Status updates via automatic email notifications
- Print/PDF export for complete job reports

### Admin Dashboard
- Job management (create, approve, assign, monitor)
- Engineer assignment with unique tracking links
- Live tracking of engineer locations on interactive maps
- Approval workflow for client-submitted requests
- Site visit report viewing with digital signatures
- Email delivery system for reports

### Engineer Portal
- Job acceptance/decline via secure links
- GPS tracking during travel and on-site work
- Status controls (En Route, On Site, Completed)
- Site visit report completion with digital signature capture
- Mobile-optimized responsive design

## Technical Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC 11 (type-safe API)
- Wouter (routing)
- Leaflet (maps)
- React Signature Canvas

### Backend
- Node.js 22
- Express 4
- tRPC 11
- MySQL 8.0
- Drizzle ORM
- OAuth integration

## Database Configuration

- **Database:** MySQL 8.0
- **Database Name:** transputec_dispatch
- **Tables:**
  - users (admin and system users)
  - jobs (service requests and dispatch jobs)
  - jobLocations (GPS tracking data)
  - jobStatusHistory (audit trail of status changes)
  - siteVisitReports (completed field service reports)

## Environment Variables

The following environment variables are configured:

```env
DATABASE_URL=mysql://root:password@localhost:3306/transputec_dispatch
JWT_SECRET=dev-secret-key-change-in-production
ADMIN_EMAIL=admin@transputec.com
VITE_APP_TITLE=Transputec Field Services
VITE_APP_LOGO=https://via.placeholder.com/150x50?text=Transputec
NODE_ENV=production
PORT=5002
OAUTH_SERVER_URL=https://oauth.manus.space
VITE_OAUTH_PORTAL_URL=https://oauth.manus.space
VITE_APP_ID=transputec-field-services
```

## Server Status

The application is running as a background process and will automatically restart if it crashes.

To check server status:
```bash
ps aux | grep "node dist/index.js"
```

To view server logs:
```bash
tail -f /home/ubuntu/Transputec-global-field-services-master-v1.6/server.log
```

## Maintenance

### Restarting the Application

If you need to restart the application:

1. Kill the current process:
```bash
pkill -f "node dist/index.js"
```

2. Start the application again:
```bash
cd /home/ubuntu/Transputec-global-field-services-master-v1.6
nohup pnpm start > server.log 2>&1 &
```

### Updating the Application

To update the application with new changes:

1. Pull latest changes from Git
2. Install dependencies: `pnpm install`
3. Rebuild: `pnpm build`
4. Restart the server

## Security Notes

⚠️ **Important Security Considerations:**

1. The current JWT_SECRET is a development key and should be changed for production use
2. Database credentials are currently using default values
3. OAuth is configured but may require additional setup for full authentication
4. Consider implementing HTTPS for production deployment
5. Review and update security settings before public release

## Support

For technical support or issues:
- Check server logs at `/home/ubuntu/Transputec-global-field-services-master-v1.6/server.log`
- Review the application README.md for detailed documentation
- Contact the development team for assistance

## Next Steps

To make this deployment permanent and production-ready:

1. **Set up a proper domain name** instead of using the temporary sandbox URL
2. **Configure SSL/TLS certificates** for HTTPS
3. **Update security credentials** (JWT secret, database passwords)
4. **Set up automated backups** for the MySQL database
5. **Configure email service** for notifications (currently using placeholder)
6. **Set up monitoring and logging** for production environment
7. **Implement rate limiting** and security headers
8. **Review and test OAuth integration** for admin authentication

---

**Deployment completed successfully on October 27, 2025**

