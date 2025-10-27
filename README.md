# Transputec Field Engineer Dispatch & Tracking System

A comprehensive web-based application for managing on-demand IT field service engineer dispatch with real-time GPS tracking, client self-service portal, and digital site visit reports.

## Features

### Client Portal
- **Self-Service Request Submission** - Clients can submit service requests without login
- **Geocoded Address Search** - Intelligent address lookup with map-based location selection
- **Real-Time Job Tracking** - Live engineer location tracking with ETA calculations
- **Status Updates** - Automatic email notifications for all status changes
- **Print/PDF Export** - Download complete job reports including Site Visit Reports

### Admin Dashboard
- **Job Management** - Create, approve, assign, and monitor all field service jobs
- **Engineer Assignment** - Assign jobs to field engineers with unique tracking links
- **Live Tracking** - Monitor engineer locations in real-time on interactive maps
- **Approval Workflow** - Review and approve client-submitted requests
- **Site Visit Reports** - View completed reports with digital signatures
- **Email Delivery** - Send reports to specified recipients

### Engineer Portal
- **Job Acceptance** - Accept or decline assignments via secure links
- **GPS Tracking** - Automatic location tracking during travel and on-site work
- **Status Controls** - Update job status (En Route, On Site, Completed)
- **Site Visit Reports** - Complete detailed reports with digital signature capture
- **Mobile Optimized** - Fully responsive design for field use

### Technical Features
- **Real-Time Updates** - Polling-based updates every 5-10 seconds
- **Live Maps** - OpenStreetMap integration with Leaflet
- **Email Notifications** - Automated emails for admins and clients
- **Digital Signatures** - Touch-enabled signature capture
- **Time Tracking** - Automatic tracking of travel time and on-site duration
- **Multi-Status Workflow** - Pending → Approved → Assigned → Accepted → En Route → On Site → Completed

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC 11 (type-safe API)
- Wouter (routing)
- Leaflet (maps)
- React Signature Canvas

### Backend
- Node.js
- Express 4
- tRPC 11
- MySQL/TiDB (Drizzle ORM)
- Manus OAuth
- Nodemailer (emails)

## Installation

### Prerequisites
- Node.js 22+
- pnpm
- MySQL or TiDB database

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/rishisehgal86/Transputec-global-field-services-master-v1.6.git
cd Transputec-global-field-services-master-v1.6
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@transputec.com
VITE_APP_TITLE=Transputec Field Services
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

4. **Initialize database**
```bash
pnpm db:push
```

5. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Schema

### Tables
- **users** - Admin and system users
- **jobs** - Service requests and dispatch jobs
- **job_locations** - GPS tracking data
- **job_status_history** - Audit trail of status changes
- **site_visit_reports** - Completed field service reports

## Customization for Different Clients

### Branding
Update environment variables:
- `VITE_APP_TITLE` - Company/client name
- `VITE_APP_LOGO` - Logo URL
- `ADMIN_EMAIL` - Notification recipient

### Styling
Edit `client/src/index.css` for:
- Color scheme (CSS variables)
- Typography
- Spacing and layout

### Features
Each client deployment can have custom features by:
- Creating client-specific branches
- Modifying `server/routers.ts` for business logic
- Adjusting `drizzle/schema.ts` for data requirements

## Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Environment Setup
Ensure all environment variables are configured for production:
- Database connection string
- Email SMTP settings
- OAuth configuration
- Domain settings

## Usage

### For Administrators
1. Sign in to access Admin Dashboard
2. Review pending client requests
3. Approve and assign engineers
4. Monitor jobs in real-time
5. Access completed Site Visit Reports

### For Clients
1. Visit the public portal
2. Click "Request Service"
3. Fill in job details with geocoded address
4. Receive tracking link via email
5. Monitor engineer progress in real-time
6. Print/download final reports

### For Engineers
1. Receive job link via email/SMS
2. Accept or decline assignment
3. Update status when traveling
4. Complete Site Visit Report on-site
5. Capture client signature
6. Submit to complete job

## Version History

- **v1.6.1** - Print functionality for client reports
- **v1.6** - PDF export (replaced with print)
- **v1.5** - Site Visit Report system with digital signatures
- **v1.4** - Client email confirmation and tracking links
- **v1.3** - Email notification system
- **v1.2** - Client self-service portal
- **v1.1** - Enhanced address geocoding
- **v1.0** - Initial release with core tracking features

## Support

For technical support or customization requests, contact the development team.

## License

Proprietary - Transputec Global IT Services

