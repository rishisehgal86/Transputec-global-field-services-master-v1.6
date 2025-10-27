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

