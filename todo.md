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
- [ ] Create initial checkpoint for deployment

