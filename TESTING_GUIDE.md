# Testing Guide - Version 3.1

## 🔗 Development Server
**URL:** https://3002-i6l23aoqjef46vetq4het-e22707a9.manusvm.computer

**Admin Login Credentials:**
- Email: `admin@transputec.com`
- Password: `Admin@123`

---

## ✅ Feature Testing Checklist

### 1. Dark Mode Toggle (NEW)

**What to test:** Theme switching across all pages

**Steps:**
1. Look for the moon icon (🌙) in the top right corner of the homepage
2. Click the moon icon to switch to dark mode
3. Verify the entire page background turns dark
4. Navigate through these pages and verify dark mode works on each:
   - Home page
   - Login page (`/login`)
   - Request Service page (`/request`)
   - Admin Dashboard (`/admin`)
   - Create Job page (`/admin/create`)
   - Job Detail page (click any job from dashboard)
   - User Management (`/admin/users`)

**Expected Results:**
- ✅ Background changes from light to dark
- ✅ Text remains readable (light text on dark background)
- ✅ Cards and components have appropriate dark backgrounds
- ✅ Theme preference is saved (refresh page and it should stay dark)
- ✅ Click sun icon (☀️) to switch back to light mode

---

### 2. Email Notification System (ENHANCED)

**What to test:** Automated emails for all job events

#### Test 2.1: New Service Request Emails

**Steps:**
1. Go to homepage → Click "Request Service"
2. Fill out the service request form with:
   - Client Name: Your name
   - Client Email: **Your real email address**
   - Site Name: Test Site
   - Fill other required fields
3. Submit the form
4. Check TWO email inboxes:
   - **rishi@karrdservicesuae.com** (admin email)
   - **Your email** (client confirmation)

**Expected Results:**
- ✅ Admin receives "New Service Request" email with job details
- ✅ Client receives "Service Request Confirmation" email with tracking link
- ✅ Both emails have clickable links that work

#### Test 2.2: Job Assignment Email

**Steps:**
1. Login as admin
2. Go to Admin Dashboard → "Create New Job"
3. Fill in job details including:
   - Client Name: Test Client
   - Site Name: Test Site
   - Other required fields
4. Submit to create the job
5. On the success page, copy the "Engineer Link"
6. Use the "Send to Engineer" feature (if available) or manually share the link

**Expected Results:**
- ✅ Engineer link is generated correctly
- ✅ Link format: `https://[domain]/engineer/[token]`

#### Test 2.3: Job Acceptance Email

**Steps:**
1. Open the engineer link from Test 2.2 in a new incognito window
2. Fill in engineer details:
   - Name: Test Engineer
   - Email: **Your email**
   - Phone: Any number
3. Click "Accept Job"
4. Check email inboxes:
   - Client email (from job creation)
   - Admin email (rishi@karrdservicesuae.com)

**Expected Results:**
- ✅ Client receives "Job Accepted" email
- ✅ Admin receives notification
- ✅ Emails show engineer name and acceptance time

#### Test 2.4: Status Update Emails

**Steps:**
1. From the accepted job (engineer view), update status:
   - Click "En Route"
   - Wait 5 seconds, click "On Site"
2. Check client email inbox

**Expected Results:**
- ✅ Client receives "Engineer En Route" email
- ✅ Client receives "Engineer On Site" email
- ✅ Each email has tracking link to view progress

#### Test 2.5: Comment Notification Emails

**Steps:**
1. From engineer view, scroll to comments section
2. Add a comment: "Test comment from engineer"
3. Submit comment
4. Check client and admin email inboxes

**Expected Results:**
- ✅ Client receives "New Comment" email
- ✅ Admin receives "New Comment" email
- ✅ Email shows who posted the comment and the message

#### Test 2.6: Job Completion Email

**Steps:**
1. From engineer view (on-site status), click "Submit Site Visit Report"
2. Fill in all SVR fields:
   - Work performed
   - Issues found
   - Recommendations
   - Sign the report
3. Submit the report
4. Check client and admin email inboxes

**Expected Results:**
- ✅ Client receives "Job Completed" email with SVR link
- ✅ Admin receives completion notification
- ✅ SVR link opens the completed report

---

### 3. Email Link Functionality (FIXED)

**What to test:** All email links work correctly

**Steps:**
1. From any email received in tests above, click the links:
   - Tracking links
   - Engineer job links
   - SVR links
2. Verify links open the correct pages

**Expected Results:**
- ✅ All links use full URLs (https://...)
- ✅ Links work from email clients (Gmail, Outlook, etc.)
- ✅ Links open the correct job/tracking page
- ✅ No "404 Not Found" errors

---

### 4. Existing Features (Regression Testing)

#### Test 4.1: Service Request Workflow

**Steps:**
1. Submit service request (see Test 2.1)
2. Login as admin
3. View pending request in dashboard
4. Click "Review Request"
5. Click "Approve Request"
6. Verify status changes to "approved"

**Expected Results:**
- ✅ Request appears in admin dashboard
- ✅ Approve/Reject buttons work
- ✅ Status updates correctly

#### Test 4.2: Job Creation & Engineer Assignment

**Steps:**
1. Create new job as admin (see Test 2.2)
2. Copy engineer link
3. Open engineer link
4. Accept job as engineer
5. Update status to "En Route"
6. Share location (if prompted)
7. Update status to "On Site"

**Expected Results:**
- ✅ Engineer can accept job
- ✅ Status updates work
- ✅ Location tracking works (if enabled)

#### Test 4.3: Client Tracking

**Steps:**
1. From any created job, copy the client tracking link
2. Open in new incognito window
3. View job progress

**Expected Results:**
- ✅ Client can view job status
- ✅ Timeline shows all status changes
- ✅ Engineer location visible (if shared)
- ✅ Comments visible

#### Test 4.4: Site Visit Report (SVR)

**Steps:**
1. From engineer view with "on_site" status
2. Click "Submit Site Visit Report"
3. Fill all fields
4. Add signature
5. Submit report
6. View completed SVR

**Expected Results:**
- ✅ SVR form appears
- ✅ All fields save correctly
- ✅ Signature captures properly
- ✅ PDF/view of completed SVR works

---

## 🐛 Known Issues to Watch For

1. **Email Spam Folders:** Check spam/junk if emails don't arrive in inbox
2. **Email Delay:** Emails may take 30-60 seconds to arrive
3. **Dark Mode Flash:** Page might briefly show light mode before switching to dark on load
4. **Mobile Responsiveness:** Test on mobile devices for dark mode appearance

---

## 📊 Testing Summary Template

After testing, fill this out:

```
✅ Dark Mode Toggle: [ ] Pass [ ] Fail
✅ New Service Request Emails: [ ] Pass [ ] Fail
✅ Job Assignment Email: [ ] Pass [ ] Fail
✅ Job Acceptance Email: [ ] Pass [ ] Fail
✅ Status Update Emails: [ ] Pass [ ] Fail
✅ Comment Notification Emails: [ ] Pass [ ] Fail
✅ Job Completion Email: [ ] Pass [ ] Fail
✅ Email Links Work: [ ] Pass [ ] Fail
✅ Service Request Workflow: [ ] Pass [ ] Fail
✅ Job Creation & Assignment: [ ] Pass [ ] Fail
✅ Client Tracking: [ ] Pass [ ] Fail
✅ Site Visit Report: [ ] Pass [ ] Fail
```

---

## 🔍 Troubleshooting

### Emails Not Arriving
1. Check spam/junk folder
2. Verify email address entered correctly
3. Check server console logs for email errors
4. Confirm SMTP credentials are working

### Dark Mode Not Working
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try different browser
4. Check browser console for JavaScript errors

### Links Not Working
1. Verify you're using the correct domain
2. Check if job token is valid
3. Ensure you're not in preview mode (publish first)

---

## 📝 Reporting Issues

If you find any issues, please note:
1. What feature you were testing
2. What you expected to happen
3. What actually happened
4. Screenshot (if applicable)
5. Browser and device used

