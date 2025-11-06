# Transputec Dispatch App TODO

## Database Schema & Backend
- [x] Create jobs table with all dispatch form fields
- [x] Create job_locations table for tracking engineer GPS coordinates
- [x] Create job_status_history table for audit trail
- [x] Implement job creation API endpoint
- [x] Implement job acceptance/decline API endpoint
- [x] Implement location update API endpoint
- [x] Implement job status update API endpoint
- [ ] Implement real-time WebSocket for live updates

## Frontend - Admin Interface
- [x] Create admin dashboard with job list
- [x] Create job creation form with all dispatch fields
- [x] Implement job detail view with live tracking map
- [x] Add shareable link generation for engineers
- [x] Add shareable link generation for clients

## Frontend - Engineer Interface
- [x] Create engineer job view page (accessible via link)
- [x] Implement job acceptance/decline functionality
- [x] Add geolocation permission request
- [x] Implement automatic location tracking during job
- [x] Add job status controls (en route, on site, completed)

## Frontend - Client Interface
- [x] Create read-only client tracking page (accessible via link)
- [x] Display job details and current status
- [x] Show live engineer location on map
- [x] Display time tracking (travel time, on-site time)

## Real-time Features
- [x] Implement polling-based real-time updates (5-10 second intervals)
- [x] Add live location updates on map
- [x] Add real-time status change notifications
- [x] Implement automatic location tracking

## Testing & Deployment
- [x] Test job creation workflow
- [x] Test engineer acceptance workflow
- [x] Test location tracking accuracy
- [x] Test real-time updates across all views
- [x] Create initial checkpoint for deployment



## Bug Fixes
- [x] Add live tracking map to admin job detail page
- [x] Show both engineer location and site location on map
- [x] Calculate and display ETA to site when engineer is en route
- [x] Add job update/close functionality for admin



## New Bug Fixes
- [x] Fix blank map display - ensure Leaflet map initializes correctly
- [x] Verify map tiles load properly on both admin and client pages



## Version 2 Features
- [x] Add geocoding to job creation form for site address
- [x] Capture and store site geo-coordinates (latitude/longitude)
- [x] Display site location pin on tracking maps
- [x] Calculate accurate ETA using distance and transport speed
- [x] Add "Return to Pin" button on map displays
- [x] Show both engineer and site locations on same map



## Version 2.1 Improvements
- [x] Update geocoding to return multiple address suggestions
- [x] Add address selection dropdown UI
- [x] Allow user to select exact address from map database results
- [x] Auto-populate selected address and coordinates



## Version 1.2 - Client Self-Service Portal
- [x] Create public ticket request page (no login required)
- [x] Add new job statuses: "pending_approval", "approved", "rejected"
- [x] Update database schema to support pending requests
- [x] Create client-facing simplified form with mandatory fields
- [x] Add admin approval/rejection workflow
- [x] Add engineer assignment step in admin interface
- [x] Update admin dashboard to show pending requests
- [x] Determine mandatory vs optional fields for client form
- [ ] Add email/notification for new ticket requests (future enhancement)



## Version 1.3 - Email Notifications
- [x] Set up email notification system for admin
- [x] Send email to admin when client submits new ticket
- [x] Include ticket details in notification email
- [x] Add admin email configuration via environment variable



## Version 1.4 - Client Email Confirmation
- [x] Add client email field to ticket request form (mandatory)
- [x] Send email confirmation to client when ticket is submitted
- [x] Include tracking link in client confirmation email
- [x] Create Site Visit Report (SVR) database schema
- [x] Install signature pad library for digital signatures
- [x] Create SVR database helper functions
- [x] Create email template for SVR delivery

## Version 1.5 - Site Visit Report (SVR) - Complete
- [x] Build SVR form component with all Transputec SVR fields
- [x] Add digital signature capture for client sign-off
- [x] Integrate SVR form into engineer job completion workflow
- [x] Require SVR completion before ticket can be marked as completed
- [x] Display completed SVR on admin job detail page
- [x] Display completed SVR on client tracking page
- [x] Add email SVR functionality for admin to send to specified address
- [x] Store SVR permanently with ticket even after closure
- [x] Add SVR router endpoints for create, get, and email



## Version 1.4.1 - Immediate Tracking Link Display
- [x] Show tracking link immediately after successful request submission
- [x] Display tracking URL on success page with copy button
- [x] Update createRequest mutation to return tracking token



## Version 1.4.2 - Enhanced Client Tracking Page
- [x] Add comprehensive request status display with clear badges
- [x] Display complete site and service details
- [x] Show timeline of request submission, approval, and completion
- [x] Display engineer name when assigned
- [x] Show ETA when engineer is en route
- [x] Display time on site duration
- [x] Add status history timeline with all changes
- [x] Show last updated timestamp with auto-refresh indicator
- [x] Improve layout and information hierarchy
- [x] Add contact information section



## Version 1.6 - PDF Export for Client Portal
- [x] Install PDF generation library (jsPDF and html2canvas)
- [x] Add "Save to PDF" button to client tracking page header
- [x] Generate PDF with job details, status, and timeline
- [x] Include Site Visit Report in PDF when job is completed
- [x] Multi-page PDF support for long content



## Version 1.6.1 - Replace PDF with Print Feature
- [x] Remove jsPDF and html2canvas from component
- [x] Replace "Save to PDF" button with "Print" button
- [x] Implement browser print functionality
- [x] Add print-specific CSS for clean output



## Version 1.6.2 - Display Links in Admin Portal
- [x] Add engineer link display with copy button in admin job detail page
- [x] Add client tracking link display with copy button in admin job detail page
- [x] Show links in a dedicated section for easy access




## Version 1.7 - Complete Local Authentication System
- [ ] Update users table schema for local auth (already done in feature branch)
- [ ] Create authentication middleware and JWT session handling
- [ ] Build login page with email/password form
- [ ] Create super admin initialization on first startup
- [ ] Build admin user management interface
- [ ] Replace OAuth context with local auth context
- [ ] Update all protected routes to use local auth
- [ ] Create password reset functionality
- [ ] Add session timeout and security features
- [ ] Test complete authentication flow
- [ ] Create initial super admin account
- [ ] Remove Manus OAuth dependencies




## Bug Fix - Login Redirect Issue
- [x] Investigate login redirect after successful authentication
- [x] Fix redirect to use window.location.replace()
- [x] Add SPA routing configuration files for various hosting platforms
- [x] Create comprehensive HOSTING.md guide
- [x] Test login flow on external hosting
- [x] Push fix to demoenvironment branch




## Version 1.8 - Security & Feature Enhancements
- [x] Remove default credentials display from login page
- [x] Add videoConferenceLink field to jobs table
- [x] Add video conference link input to request service form
- [x] Display video conference link on engineer view
- [x] Display video conference link on admin job detail
- [x] Display video conference link on client tracker
- [ ] Add edit capability for video link on admin job detail
- [ ] Add edit capability for video link on client tracker
- [x] Create password change functionality for logged-in users
- [x] Create user management page for admins (create/edit/delete users)
- [x] Add navigation link to user management in admin dashboard

