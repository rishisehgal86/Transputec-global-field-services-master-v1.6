# Transputec Field Services - On-Demand IT Engineer Platform

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/transputec-field-services?referralCode=transputec)

A comprehensive web-based SaaS platform for managing on-demand IT field service engineer dispatch with real-time tracking, client self-service portal, video conferencing integration, and robust user management.

## 🚀 Quick Deploy

Click the button above to deploy to Railway in one click, or:

**Manual Deploy:**
1. Fork this repository
2. Sign up at [Railway.app](https://railway.app)
3. Create new project from GitHub
4. Select branch: `v2.0-production-ready`
5. Add MySQL database
6. Deploy!

## ✨ Features

### Client Portal
- **Self-Service Request Submission** - Clients can submit service requests without login
- **Geocoded Address Search** - Intelligent address lookup with map-based location selection
- **Video Conference Integration** - Add meeting links for remote engineer support
- **Real-Time Job Tracking** - Live engineer location tracking with ETA calculations
- **Status Updates** - Automatic email notifications for all status changes
- **Editable Video Links** - Update video conference links anytime before job completion
- **Print/PDF Export** - Download complete job reports including Site Visit Reports

### Admin Dashboard
- **Robust Local Authentication** - Secure username/password authentication (no external dependencies)
- **User Management** - Superuser can create/manage admin users
- **Password Management** - Change password functionality with security validation
- **Job Management** - Create, approve, assign, and monitor all field service jobs
- **Engineer Assignment** - Assign jobs to field engineers with unique tracking links
- **Live Tracking** - Monitor engineer locations in real-time on interactive maps
- **Approval Workflow** - Review and approve client-submitted requests
- **Site Visit Reports** - View completed reports with digital signatures
- **Email Delivery** - Send reports to specified recipients

### Engineer Portal
- **Job Acceptance** - Accept or decline assignments via secure links
- **Video Conference Access** - One-click join for client video meetings
- **GPS Tracking** - Automatic location tracking during travel and on-site work
- **Status Controls** - Update job status (En Route, On Site, Completed)
- **Site Visit Reports** - Complete detailed reports with digital signature capture
- **Mobile Optimized** - Fully responsive design for field use

### Security & Authentication (v2.0)
- **Local Authentication** - No external OAuth dependencies
- **Superuser System** - Full administrative control (rishis@transputec.com)
- **User Management** - Create/deactivate admin users
- **Password Security** - Bcrypt hashing, minimum 8 characters
- **Role-Based Access** - Super admin vs regular admin permissions
- **Session Management** - Secure token-based sessions

### Modern UI (v2.0)
- **Professional Design** - Deep navy blue theme with gradient backgrounds
- **Trust Indicators** - ISO 27001, ITIL, 24/7 NOC, GPS tracking badges
- **Responsive Layout** - Mobile-first design that works on all devices
- **Feature Cards** - Colorful, icon-based feature showcase
- **Clear CTAs** - Multiple conversion points throughout the interface

## 🛠 Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC 11 (type-safe API)
- Wouter (routing)
- Leaflet (maps)
- React Signature Canvas
- Sonner (toast notifications)

### Backend
- Node.js 22
- Express 4
- tRPC 11
- MySQL (Drizzle ORM)
- Bcrypt (password hashing)
- Nodemailer (emails)

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm
- MySQL 8.0+

### Local Development Setup

1. **Clone the repository**
```bash
git clone -b v2.0-production-ready https://github.com/rishisehgal86/Transputec-global-field-services-master-v1.6.git
cd Transputec-global-field-services-master-v1.6
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=mysql://root:password@localhost:3306/transputec_dispatch
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=transputec_dispatch
MYSQL_USER=root
MYSQL_PASSWORD=password

# Application
NODE_ENV=development
PORT=5000

# OAuth (for future integration)
OAUTH_CLIENT_ID=transputec-field-services
OAUTH_CLIENT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://oauth.manus.space
VITE_OAUTH_CLIENT_ID=transputec-field-services
VITE_OAUTH_SERVER_URL=https://oauth.manus.space
```

4. **Set up MySQL database**
```bash
mysql -u root -p
CREATE DATABASE transputec_dispatch;
```

5. **Initialize database tables**
```bash
pnpm db:push
```

6. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:5000`

### Default Credentials

**Superuser Account:**
- Email: `rishis@transputec.com`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change the default password immediately after first login!

## 🐳 Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# Or build manually
docker build -t transputec-field-services .
docker run -p 5000:5000 transputec-field-services
```

## 🌐 Production Deployment

### Railway (Recommended)
1. Click the "Deploy on Railway" button above
2. Add MySQL database service
3. Configure environment variables
4. Deploy!

### Render
1. Connect your GitHub repository
2. Add MySQL database
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `pnpm start`

### VPS (DigitalOcean, Linode, etc.)
See [PERMANENT_DEPLOYMENT_GUIDE.md](./PERMANENT_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Custom Domain
See [CUSTOM_DOMAIN_SETUP_GUIDE.md](./CUSTOM_DOMAIN_SETUP_GUIDE.md) for DNS configuration.

## 📊 Database Schema

### Tables
- **users** - Admin users with authentication
- **jobs** - Service requests and dispatch jobs
- **job_locations** - GPS tracking data
- **job_status_history** - Audit trail of status changes
- **site_visit_reports** - Completed field service reports

## 🎨 Customization

### Branding
Update environment variables:
- `VITE_APP_TITLE` - Company/client name
- `VITE_APP_LOGO` - Logo URL

### Styling
Edit `client/src/index.css` for:
- Color scheme (CSS variables)
- Typography
- Spacing and layout

## 📖 Usage

### For Administrators
1. Sign in at `/login`
2. Review pending client requests
3. Approve and assign engineers
4. Monitor jobs in real-time
5. Manage users via User Management
6. Change password in Settings

### For Clients
1. Visit the public portal
2. Click "Request an Engineer"
3. Fill in job details with address
4. Add video conference link (optional)
5. Receive tracking link via email
6. Edit video link anytime from tracker
7. Monitor engineer progress in real-time

### For Engineers
1. Receive job link via email/SMS
2. Accept or decline assignment
3. View video conference link
4. Update status when traveling
5. Join video call when on-site
6. Complete Site Visit Report
7. Capture client signature

## 🔄 Version History

- **v2.0** (Current) - SaaS-ready with local auth, user management, video conferencing, modern UI
- **v1.6.1** - Print functionality for client reports
- **v1.6** - PDF export (replaced with print)
- **v1.5** - Site Visit Report system with digital signatures
- **v1.4** - Client email confirmation and tracking links
- **v1.3** - Email notification system
- **v1.2** - Client self-service portal
- **v1.1** - Enhanced address geocoding
- **v1.0** - Initial release with core tracking features

## 🗺 Roadmap

See [SaaS_Transformation_Plan.md](./saas_transformation_plan/SaaS_Transformation_Plan.md) for the full marketplace transformation roadmap including:
- Multi-supplier bidding system
- Payment integration (Stripe Connect)
- Dynamic pricing engine
- Supplier portal
- Client subscriptions

## 📄 License

Proprietary - Transputec Global IT Services

## 🤝 Support

For technical support or customization requests:
- Email: rishis@transputec.com
- GitHub Issues: [Create an issue](https://github.com/rishisehgal86/Transputec-global-field-services-master-v1.6/issues)

---

**Made with ❤️ by Transputec Global IT Services**

