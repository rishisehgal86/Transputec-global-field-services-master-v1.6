# FieldPulse Go Dispatch App TODO

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
- [x] Build SVR form component with all FieldPulse SVR fields
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




## Version 1.8.1 - Video Conference Link Form Fix
- [x] Fix video conference link field not appearing in request service form (field is present)
- [x] Push database schema changes for videoConferenceLink column
- [x] Verify video conference link displays correctly in all views
- [x] Add edit capability for video conference link in admin job detail
- [x] Add edit capability for video conference link in client tracker




## Version 1.9 - SVR Photo & Video Upload
- [x] Add media files table to database schema for SVR attachments
- [x] Push database schema changes for media files
- [x] Add file upload endpoint for photos and videos
- [x] Update engineer SVR form to support photo/video uploads
- [x] Upload media files after SVR submission
- [x] Display uploaded media in admin SVR view
- [x] Display uploaded media in client SVR view
- [x] Add file size and type validation
- [x] Add job comments table to database (supports engineer, client, admin)
- [x] Create comment posting functionality for all user types
- [x] Display comments on engineer view page
- [x] Display comments on admin job detail page
- [x] Display comments on client tracker page




## Version 2.0 - Smart Milestone Tracking (iOS Compatible)
- [x] Add automatic location capture when engineer accepts job
- [x] Add automatic location capture when engineer clicks "En Route"
- [x] Add automatic location capture when engineer clicks "Arrived"
- [x] Add automatic location capture when engineer completes job
- [x] Create "Update My Location" manual button on engineer page
- [x] Display last location update timestamp on engineer page
- [x] Show location update history on admin job detail page (already exists in LiveMap)
- [x] Add location update notifications/indicators




## Version 2.0.1 - Fix Live Map & ETA Display
- [x] Investigate why live map is not showing (cache issue)
- [x] Restore live map display on admin job detail page
- [x] Restore live map display on client tracker page
- [x] Verify ETA calculations are working
- [x] Ensure milestone tracking works alongside live tracking




## Version 2.0.2 - Fix Request Form Submission
- [x] Fix videoConferenceLink field causing database insertion error
- [x] Ensure empty videoConferenceLink is handled correctly (filter undefined values)
- [x] Test request form submission with and without video link (ready for user testing)




## Version 2.0.3 - Cookie Configuration Fix
- [x] Update getSessionCookieOptions to handle dev/prod environments
- [x] Use 'lax' sameSite for HTTP (development)
- [x] Use 'none' sameSite for HTTPS (production)




## Version 2.0.4 - Fix Comment Posting
- [x] Fix jobComments database insertion error (applied undefined filter)
- [x] Ensure comment text is properly passed to database
- [x] Test comment posting from all user types (admin, engineer, client)




## Version 2.1 - Email Notification System
- [x] Request email SMTP credentials from user
- [x] Install nodemailer package
- [x] Create email service module with Gmail SMTP
- [x] Create email templates for job notifications
- [x] Add email trigger for new job assignments
- [x] Add email trigger for job status changes
- [x] Add email trigger for new comments
- [x] Add email trigger for job completion
- [x] Add email notifications for new service requests to admin
- [x] Test email notifications
- [x] Update admin email configuration to rishi@karrdservicesuae.com
- [x] Add detailed logging for email debugging

ns



- [x] Fix client tracking link not working in email notifications




## Phase 1: Quick Wins & UX Improvements

### 1.1 Dark Mode Toggle
- [x] Extend ThemeProvider to support switchable themes
- [x] Add theme toggle button in header
- [x] Store preference in localStorage
- [x] Update CSS variables for dark theme colors

### 1.2 Quick Filters on Dashboard
- [ ] Add filter state management to dashboard
- [ ] Create filter chip components
- [ ] Implement backend query filters (today, urgent, overdue, pending, in_progress)
- [ ] Add URL query params for shareable filters

### 1.3 Job Duplication Feature
- [ ] Add "Duplicate" button to job detail page
- [ ] Create duplicate endpoint in backend
- [ ] Generate new job token for duplicated job
- [ ] Pre-fill form with duplicated data

### 1.4 Email Delivery Status Logging
- [ ] Create email_logs table in database
- [ ] Add logging to sendEmail function
- [ ] Create email log viewer in admin panel
- [ ] Track recipient, subject, status, timestamp, error message

### 1.5 Automated Thank You Emails
- [ ] Create sendThankYouEmail function
- [ ] Design thank you email template
- [ ] Trigger on job completion
- [ ] Include satisfaction survey link (optional)



- [x] Fix dark mode to affect entire page background (not just components)



- [x] Apply dark mode theme-aware colors to all pages (Login, RequestService, AdminDashboard, CreateJob, JobDetail, EngineerView, ClientTracker, UserManagement)



- [x] Fix Admin Controls section white background in JobDetail page dark mode



- [ ] Fix job filter categorization logic - investigate and correct miscategorization issues
- [x] Fix job duplication to pre-fill form with original job data instead of showing empty form




## Job Cancellation Workflow
- [x] Add cancellationReason field to jobs table schema
- [x] Add cancelledBy field to track who cancelled the job
- [x] Add cancelledAt timestamp field
- [x] Push database schema changes
- [x] Create sendCancellationNotification email function
- [x] Add cancelJob endpoint in backend with reason parameter
- [x] Create CancelJobDialog component with reason dropdown
- [x] Add Cancel Job button to JobDetail page (admin only)
- [x] Send notifications to client, engineer (if assigned), and admin
- [ ] Test cancellation workflow end-to-end




## Engineer Reassignment Feature
- [x] Create reassign endpoint to generate new job token
- [x] Clear previous engineer details when reassigning
- [x] Add reassignment email notification function (admin can use existing Send to Engineer)
- [x] Add "Reassign to Another Engineer" button for declined jobs
- [x] Display new engineer link after reassignment
- [ ] Test reassignment workflow end-to-end




## Phase 2: Rebranding to FieldPulse Go

- [x] Copy logo to public directory
- [x] Update VITE_APP_TITLE and VITE_APP_LOGO environment variables (user must update via Management UI)
- [x] Update client/src/const.ts with new branding
- [x] Implement FieldPulse Go color palette (Pulse Orange #FF7A00, Electric Cyan #00D7D7, Deep Navy #0A1E3D)
- [x] Update typography to Poppins headers and Inter body text
- [x] Add gradient accent styles (linear-gradient(90deg, #FF7A00 0%, #00D7D7 100%))
- [x] Update all page references from Transputec to FieldPulse Go
- [x] Enhance landing page with design language elements
- [x] Update email templates with FieldPulse Go branding
- [x] Test all pages with new branding




## Color Scheme Refinement

- [ ] Update color palette to navy blue, orange, and white (remove cyan/teal)
- [ ] Simplify gradient to use only orange
- [ ] Update all accent colors from cyan to orange or blue
- [ ] Test color scheme across all pages




## Color Scheme Refinement

- [x] Update color palette to navy blue, orange, and white (remove cyan/teal)
- [x] Simplify gradient to use only orange
- [x] Update all accent colors from cyan to orange or blue
- [x] Remove all remaining "Transputec" references and replace with "FieldPulse"
- [x] Test color scheme across all pages




## Header Updates

- [x] Remove "Transputec" text from page headers
- [x] Update all page headers to display FieldPulse Go logo
- [x] Ensure logo displays properly on all pages
- [x] Test header on light and dark modes




## Dark Mode Logo

- [x] Generate white text version of FieldPulse Go logo for dark mode
- [x] Implement theme-aware logo switching in all components
- [x] Test logo visibility in both light and dark modes




## Universal Logo Fix

- [x] Generate logo with outlined white text that works on both light and dark backgrounds
- [x] Update LogoImage component to use single universal logo
- [x] Remove theme-specific logo switching
- [x] Test visibility on both light and dark modes




## Logo Resizing

- [x] Increase header height and padding to accommodate logo
- [x] Enlarge logo size for better visibility
- [x] Update all page headers with expanded dimensions
- [x] Test logo display across all pages




## Header Tagline

- [x] Add "On-Demand Despatch Field Services Platform" tagline next to logo
- [x] Update all page headers with tagline
- [x] Style tagline appropriately
- [x] Test display on all pages




## Email Sender Update

- [x] Update email sender address to admin@field-pulse.io
- [x] Update all email templates with new sender
- [x] Update Gmail app password for new account




## Email Delivery Issue

- [x] Check server logs for email errors
- [x] Verify email sending code is being called
- [x] Test SMTP connection
- [x] Fix email delivery issue (updated admin email to admin@field-pulse.io)
- [x] Verify emails are received




## Client Email Issue

- [x] Debug why client confirmation emails not being sent
- [x] Check email sending logic for clients
- [x] Fix client email delivery
- [x] Test client receives confirmation email (working - emails delivered successfully)




## Admin Credentials Update

- [x] Update super admin email to admin@field-pulse.io
- [x] Update super admin password to Admin@123
- [x] Test login with new credentials




## Job Export Feature
- [x] Create backend endpoint to export jobs by date range
- [x] Build date range picker UI component
- [x] Add "Export This Month" shortcut button
- [x] Generate CSV/Excel file with job data
- [x] Add status filter to export
- [x] Test export functionality with various date ranges




## Export Enhancements
- [ ] Install xlsx package for Excel export
- [ ] Add Excel format option to export dialog
- [ ] Implement XLSX generation with proper formatting
- [ ] Add email export functionality with recipient input
- [ ] Create scheduled export configuration page
- [ ] Implement automated daily/weekly export scheduler
- [ ] Add email delivery for scheduled exports
- [ ] Test all export formats and delivery methods




## Multi-Project Environment
- [x] Create projects table in database schema
- [x] Add projectId field to jobs table
- [x] Add projectsEnabled flag to organizations table
- [x] Create project management backend functions
- [x] Add project CRUD API endpoints
- [x] Build project management page for admin
- [x] Add project filter to admin dashboard
- [x] Create project-specific job request page
- [x] Add project ID verification to main request form
- [x] Generate unique project request links
- [x] Test project-based job assignment



## Project Site Management
- [x] Add restrictToSites boolean field to projects table
- [x] Create project_sites table with geocoding support
- [x] Build Excel template generator for site uploads
- [x] Implement bulk site import with validation
- [x] Create site management UI in project details
- [x] Add site selector to project request forms
- [x] Implement automatic geocoding for uploaded sites
- [x] Test site upload and selection workflow




## Critical Bug Fixes
- [x] Fix project creation database error
- [x] Verify projects table schema matches insert query
- [x] Run database migration to create projects table



- [x] Fix Excel template download error
- [x] Check site-template.ts endpoint
- [x] Add error handling to template generation
- [x] Verify xlsx package is working correctly




## Site Geo-Location Validation
- [x] Add coordinate validation during site upload
- [x] Implement automatic geocoding for sites without coordinates
- [x] Add visual indicators (badges/icons) for geo-located sites
- [x] Filter site selector to only show geo-located sites in job requests
- [ ] Add "Verify Location" button for sites missing coordinates
- [ ] Display warning for non-geo-located sites in admin view




## Interactive Map Geo-Location Editing
- [x] Create SiteLocationMap component with Leaflet map
- [x] Add click-to-place marker functionality on map
- [x] Add drag-to-move marker functionality
- [x] Add backend endpoint to update site coordinates (PUT /api/trpc/projects.updateSiteLocation)
- [x] Integrate map editor into ProjectSites component
- [x] Show current location on map when editing
- [x] Display coordinates below map during editing
- [x] Add Save and Cancel buttons for coordinate updates
- [x] Test map editing functionality end-to-end




## Manual Site Creation Form
- [x] Create backend endpoint for manual site creation (projects.addSite) - already exists
- [x] Add createProjectSite function in project-sites-db.ts - already exists
- [x] Build AddSiteForm component with form fields
- [x] Include fields: siteName, siteAddress, city, postalCode, contactName, contactPhone, contactEmail, notes
- [x] Add automatic geocoding when address is entered
- [x] Show geocoded coordinates preview before saving
- [x] Integrate AddSiteForm into ProjectSites component
- [x] Add "Add Site Manually" button next to "Upload Sites"
- [x] Open form dialog when button is clicked
- [x] Refresh site list after successful creationtry field to projectSites schema
- [x] Make city and postalCode more flexible (optional, longer lengths)
- [ ] Update database with migration (pnpm db:push) - in progress
- [x] Update bulk upload template to include Country column
- [x] Update parseSiteUpload to handle country field
- [x] Update AddSiteForm to include country dropdown/input
- [x] Update site display in ProjectSites to show country
- [x] Update geocoding to include country in address string
- [x] Test with addresses from multiple countries




## Duplicate Site Detection
- [x] Add function to check for existing sites by name and address
- [x] Update uploadSites to skip duplicates during bulk upload
- [x] Track skipped duplicates in upload result
- [x] Show count of skipped duplicates in success message




## Project Filters & Request Links
- [x] Add project dropdown selector to filter/select specific projects
- [x] Add status filter dropdown (All/Active/Inactive)
- [x] Replace search with dropdown for better navigation
- [x] Display full request URL in project cards
- [x] Add copy button for request URL
- [x] Show toast confirmation when URL is copied




## Project Status Toggle
- [x] Rename request link label to "Project Specific Despatch Request Link"
- [x] Add toggle button to project cards for active/inactive status
- [x] Backend endpoint already exists (projects.toggleStatus)
- [x] Update UI immediately after toggle
- [x] Show confirmation toast when status changes




## Edit Site Functionality
- [x] Create backend endpoint for updating site details (projects.updateSite)
- [x] Create EditSiteForm component with all site fields pre-filled
- [x] Add Edit button (pencil icon) next to each site in ProjectSites
- [x] Open edit dialog when Edit button is clicked
- [x] Refresh site list after successful update
- [x] Show success toast after update




## Fix Sites Not Loading
- [x] Rebuild getProjectSites database function
- [x] Test query returns data correctly
- [x] Removed duplicate updateProjectSite function
- [x] Fixed dynamic imports causing query to hang
- [x] Verify frontend displays sites



## Fix Delete Site Table Refresh
- [x] Investigate delete site functionality in ProjectSites component
- [x] Check if mutation invalidation is working
- [x] Fix table refresh after deletion - added isActive filter to getProjectSites
- [x] Test delete functionality - working correctly




## Add Project ID to Service Request Form
- [x] Add optional project ID input field to RequestService form
- [x] Add project ID verification in backend (projects.verify endpoint)
- [x] Update createRequest endpoint to verify and assign project
- [x] Display project name when valid project ID is entered
- [x] Allow job creation without project ID (optional field)
- [ ] Test project assignment workflow



## Add Project Assignment to Admin Create Job Page
- [x] Add project ID field with verification to CreateJob page
- [x] Reuse same verification logic from RequestService
- [ ] Test project assignment from admin panel



## Fix Project ID Insert Error in Create Job
- [x] Check jobs table schema for projectId field
- [x] Fix create job mutation to properly handle projectId (both public and admin)
- [x] Add projectId column to jobs table in database
- [x] Add foreign key constraint
- [ ] Test job creation with project assignment




## Display Project Information in Admin Portal
- [x] Add projectId column to jobs list table
- [x] Add project information section to job details page
- [x] Test project display in both views




## Project Site Selection on Job Creation
- [x] Add project sites dropdown after project verification (both forms)
- [x] Add "Add New Site" option that shows site creation fields
- [x] New sites should be saved to project site list
- [x] Auto-populate job address from selected site
- [x] Backend endpoint to create site during job creation
- [x] Test site selection and creation workflow




## Fix Submit Button Disabled with New Site Mode
- [x] Check submit button disabled condition in both forms
- [x] Update validation to allow submission when adding new site
- [x] Test form submission works correctly




## Update Site Selection Dropdown Styling
- [x] Replace native select with shadcn Select component in RequestService
- [x] Replace native select with shadcn Select component in CreateJob
- [x] Ensure consistent styling with other form inputs
- [x] Fix database field name mismatch (address -> siteAddress)




## Fix Logo Not Displaying
- [ ] Check logo configuration in const.ts
- [ ] Verify logo file exists and path is correct
- [ ] Fix LogoImage component rendering
- [ ] Test logo display on all pages




## Email Job to Engineer Feature
- [x] Add email button to admin job details page (after job accepted)
- [x] Create email template for job notification (already exists)
- [x] Implement email sending endpoint (sendToEngineer already exists)
- [ ] Test email delivery with job link

## Document Upload System
- [x] Create job_documents table in database
- [x] Create audit_logs table in database
- [ ] Add document upload UI to create job forms (admin and public)
- [x] Implement S3 file upload for documents
- [x] Create document upload/get/delete endpoints
- [x] Integrate audit logging with document operations
- [ ] Add document display to engineer job view
- [ ] Add document display to admin job details
- [ ] Add document display to client tracking page
- [ ] Allow client to upload additional documents from tracking page
- [ ] Implement audit logging for all document operations
- [ ] Test document upload, display, and audit trail




## Fix 404 Error on Admin Create Job Route
- [x] Check App.tsx routing configuration
- [x] Verify CreateJob component exists and is imported
- [x] Fix route definition if missing (added /admin/jobs/create)
- [x] Test route access




## Engineer Email Assignment on Job Creation
- [x] Add engineer email and name fields to CreateJob form
- [x] Add "Send Email to Engineer" checkbox
- [x] Update create job endpoint to send email when checkbox is checked
- [x] Email should include job details and engineer acceptance link
- [x] Test email delivery with engineer link




## Engineer Email on Request Approval
- [x] Add dialog/modal when admin clicks approve on pending requests
- [x] Dialog should have engineer name and email fields
- [x] Add "Send Email to Engineer" option in dialog
- [x] Update approve endpoint to accept engineer details and send email
- [x] Test approval workflow with email notification




## Fix Engineer Email Notification Not Sending
- [x] Check if sendJobAssignmentNotification function exists in email.ts
- [x] Create or fix the email function with proper template
- [x] Test email delivery when creating job with engineer email
- [x] Test email delivery when approving request with engineer email




## Auto-Update Job Status When Engineer Email Sent
- [x] Update create job to change status to 'sent_to_engineer' when sendEmailToEngineer is true
- [x] Update approve request to change status to 'sent_to_engineer' when sendEmailToEngineer is true
- [x] Update job record with engineer name and email when sending
- [x] Test that engineer can access job via link after email is sent




## Manual Send to Engineer Button
- [x] "Send to Engineer" button already exists in UI
- [x] Verify button properly changes status to 'sent_to_engineer'
- [x] Test manual status transition without email




## Status Enum Validation Fix
- [x] Added 'sent_to_engineer' to updateStatus endpoint allowed status values
- [x] Fixed "Create Job & Send to Engineer" button validation error
- [x] Button now successfully transitions jobs from 'approved' to 'sent_to_engineer'




## Engineer Assignment Timeline Tracking
- [x] Add engineerName and engineerEmail fields to job_status_history table
- [x] Add emailSent field to track email delivery status
- [x] Update addJobStatusHistory function to accept engineer details
- [x] Modify updateStatus endpoint to pass engineer info to status history
- [x] Update timeline display components to show engineer assignments
- [x] Added engineer details display in ClientTracker status history
- [x] Added engineer details display in JobDetail timeline
- [x] Show email sent status with visual indicators (✓ or ⚠)




## Email Delivery Diagnostics
- [ ] Check SMTP configuration in email.ts
- [ ] Verify Gmail app password is correct
- [ ] Test email sending with diagnostic script
- [ ] Check server logs for email errors
- [ ] Verify email triggers in routers.ts are being called




## Admin Job Creation Timeline Tracking
- [ ] Update createJob endpoint to record engineer details in status history
- [ ] Add status history entry when admin creates job with engineer assignment
- [ ] Test timeline shows engineer details for admin-created jobs


## Admin Job Creation Timeline Tracking
- [x] Update createJob endpoint to record engineer details in status history
- [x] Add status history entry when admin creates job with engineer assignment
- [x] Track email delivery success/failure in timeline
- [x] Add "created" status entry for all admin-created jobs

## Resend Engineer Email Feature
- [ ] Create resendEngineerEmail endpoint in backend
- [ ] Add resend button to Engineer card in JobDetail page
- [ ] Show success/error toast on resend
- [ ] Update timeline when email is resent

## Resend Engineer Email Feature - COMPLETED
- [x] Create resendEngineerEmail endpoint in backend
- [x] Add resend button to Engineer card in JobDetail page
- [x] Show success/error toast on resend
- [x] Update timeline when email is resent
- [x] Validate job has engineer assigned before resending
- [x] Track email delivery status in timeline

## Project Site Auto-Fill Feature
- [ ] Update client request form to auto-populate address from selected project site
- [ ] Update admin job creation form to auto-populate address from selected project site
- [ ] Hide manual address fields when project site is selected
- [ ] Show manual address fields when "Create New Site" is selected
- [ ] Test both forms with project site selection

## Project Site Auto-Fill Feature - COMPLETED
- [x] Update client request form to auto-populate address from selected project site
- [x] Update admin job creation form to auto-populate address from selected project site
- [x] Hide manual address fields when project site is selected
- [x] Show manual address fields when "Create New Site" is selected
- [x] Auto-populate coordinates and contact info from project site

## Fix Project Site Address Submission
- [ ] Debug why selectedAddress isn't being submitted in client request form
- [ ] Fix client request form to include site address when project site is selected
- [ ] Debug admin job creation form address submission
- [ ] Fix admin job creation form to include site address when project site is selected
- [ ] Verify address appears in job details page after submission

## Fix Project Site Address Submission - COMPLETED
- [x] Fixed field name from site.address to site.siteAddress in client request form
- [x] Fixed field name in admin job creation form
- [x] Fixed dropdown display to show correct field
- [x] Added validation to allow submission when using existing project site
- [x] Address now properly carries through to job details page



## Multi-Tenant Data Isolation Issues
- [ ] Filter projects by organizationId in all project queries
- [ ] Filter jobs by organizationId in all job queries
- [ ] Audit all database queries to ensure tenant filtering
- [ ] Test that tenants can only see their own data




## Self-Service Authentication System
- [x] Create signup backend endpoint (register organization + admin user)
- [x] Create forgot password backend endpoint (generate reset token)
- [x] Create reset password backend endpoint (validate token + update password)
- [x] Create Signup page UI with organization registration form
- [x] Create Forgot Password page UI
- [x] Create Reset Password page UI
- [x] Add routes to App.tsx (/signup, /forgot-password, /reset-password)
- [ ] Test complete authentication flow

## Feature Restoration (Post-Merge Nov 14, 2025)
- [x] Fix TypeScript compilation errors (engineerName/engineerEmail fields, scheduledDateTime null handling)
- [x] Re-implement organization name display in admin dashboard header
- [ ] Verify multi-tenant data isolation (jobs/projects filtered by organizationId)
- [ ] Test signup/forgot-password/reset-password flows
- [ ] Verify UTC timezone display across all pages
- [ ] Test admin job creation with email validation fix


## UI Improvements (Nov 14, 2025)
- [x] Move "Create New Request" button to more prominent position at top of admin dashboard
- [x] Add quick copy button to copy public request form URL for sharing with clients
- [x] Reorganize header with clear distinction: Admin Job Creation, Job Creation Form (with copy URL icon), Logout, and other buttons
- [x] Make organization name more prominent and visible on mobile devices with "Organization:" label
- [x] Verify button positioning and layout



## Password Reset & Email Features (Nov 14, 2025)
- [x] Create password_reset_tokens table in database schema
- [x] Implement forgot password backend endpoint with token generation
- [x] Create email template for password reset instructions
- [x] Implement reset password backend endpoint with token validation
- [x] Reset password page already handles token-based reset correctly
- [x] Create welcome email template for new signups
- [x] Send welcome email on successful account creation
- [ ] Test complete forgot password flow end-to-end
- [ ] Test signup email delivery

