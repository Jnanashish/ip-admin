# Backend Security Implementation Prompt

Copy and paste this for your backend engineer:

---

## 🔒 Implement Backend Security Changes (From Frontend Audit)

### Context

The frontend team completed a security audit and implemented 11 client-side fixes. We now need backend changes to complete the security remediation. The frontend is already updated and waiting for these backend endpoints and changes.

**Priority: Critical** — Deploy within 1-2 weeks

**Reference Documentation:** See `BACKEND_SECURITY_REQUIREMENTS.md` in the repo for detailed implementation guides with code examples.

---

## Task Summary: 5 Critical Backend Changes

### 1. Replace Static API Key with Firebase ID Token Authentication (CRITICAL)

**What:** All API endpoints must now verify Firebase ID tokens instead of checking a static `x-api-key` header.

**Why:** The current API key is visible in the production JS bundle. Anyone can extract it and call the API directly.

**Implementation:**
1. Install Firebase Admin SDK: `npm install firebase-admin`
2. Initialize with your Firebase service account key
3. Create auth middleware that:
   - Extracts `Authorization: Bearer <token>` header
   - Calls `admin.auth().verifyIdToken(token)`
   - Attaches decoded user info to request: `req.firebaseUser = { uid, email }`
   - Returns 401 Unauthorized if token is invalid/missing
4. Apply this middleware to all protected routes (POST, PUT, DELETE)
5. Keep the old `x-api-key` check as a fallback for 1-2 weeks with deprecation warning
6. Remove the old `REACT_APP_API_KEY` from `.env` once migrated

**Affected Endpoints (all of them):**
- `/jd/add`, `/jd/update/:id`, `/jd/delete/:id`
- `/companydetails/add`, `/companydetails/update/:id`, `/companydetails/delete/:id`
- `/sda/banner/add`, `/sda/banner/delete/:id`
- `/sda/link/add`, `/sda/link/delete/:id`
- `/sda/linkimg/add`, `/sda/linkimg/delete/:id`
- Any other endpoint that modifies data

**Frontend Status:** ✅ Already updated — will send Firebase ID tokens in Authorization header

---

### 2. Create Backend Proxy for Telegram Messages (HIGH)

**What:** Move Telegram API calls from frontend to backend. Frontend will call your backend instead of `api.telegram.org`.

**Why:** The Telegram bot token is currently in the JS bundle. Anyone can send messages to your channels.

**Create Two Endpoints:**

1. **`POST /api/notify/telegram`**
   ```
   Request:  { title, batch, degree, link }
   Response: { success: true, messageId: 12345 }
   Route must have: preHandler: [verifyFirebaseToken, verifyAdmin]
   ```
   Logic: Format message and call `api.telegram.org/sendMessage` with your bot token from `.env`

2. **`POST /api/notify/telegram-photo`**
   ```
   Request:  { title, link, photoUrl }
   Response: { success: true, messageId: 12345 }
   Route must have: preHandler: [verifyFirebaseToken, verifyAdmin]
   ```
   Logic: Call `api.telegram.org/sendPhoto` with your bot token from `.env`

**Frontend Status:** ✅ Already updated — calls these endpoints instead of Telegram directly

---

### 3. Create Backend Proxy for Bitly URL Shortening (HIGH)

**What:** Move Bitly API calls from frontend to backend.

**Why:** The Bitly API token is currently in the JS bundle. Anyone can shorten URLs through your account.

**Create Two Endpoints:**

1. **`POST /api/util/shorten`**
   ```
   Request:  { longUrl: "https://example.com/apply" }
   Response: { shortUrl: "https://bit.ly/abc123", link: "https://bit.ly/abc123" }
   Route must have: preHandler: verifyFirebaseToken
   ```
   Logic: Validate URL format, call `api-ssl.bitly.com/v4/shorten` with your token from `.env`

2. **`GET /api/util/link-clicks/:shortCode`**
   ```
   Response: { clicks: 42, shortUrl: "https://bit.ly/abc123" }
   Route must have: preHandler: verifyFirebaseToken
   ```
   Logic: Call Bitly API to get click count

**Frontend Status:** ✅ Already updated — calls these endpoints instead of Bitly directly

---

### 4. Implement Backend Admin Authorization (MEDIUM)

**What:** Verify user is admin on the backend before allowing sensitive operations.

**Why:** Currently only checked on frontend. No server-side verification.

**Implementation:**
- Use Firebase Custom Claims (recommended):
  1. Set `isAdmin: true` claim for admin users: `admin.auth().setCustomUserClaims(uid, { isAdmin: true })`
  2. Verify in middleware: Check if `req.firebaseUser.isAdmin === true`
  3. Create `verifyAdmin` middleware that returns 403 Forbidden if not admin
  4. Apply to all admin endpoints

**Admin Endpoints (apply verifyAdmin middleware):**
- All `/jd/*` POST/PUT/DELETE routes (create, update, delete jobs)
- All `/companydetails/*` POST/PUT/DELETE routes
- All `/sda/*` POST/DELETE routes (banners, links)

**User/Read Endpoints (only need verifyFirebaseToken):**
- All GET routes (anyone authenticated can read)

---

### 5. Add Server-Side File Upload Validation (MEDIUM)

**What:** Validate file type and size on backend (not just frontend).

**Why:** Frontend validation can be bypassed. We need server-side enforcement.

**Implementation:**
1. Check file size: Reject if > 500KB for logos, > 5MB for banners
2. Check MIME type: Only allow `image/jpeg`, `image/png`, `image/webp`
3. Optional but recommended: Verify file signature (magic bytes) to prevent disguised files
4. Return 400 Bad Request with descriptive error if validation fails

**Apply to File Upload Endpoints:**
- Company logo uploads (in `/companydetails/add` and `/companydetails/update/:id`)
- Job banners (in `/jd/add` and `/jd/update/:id`)
- Ad banners (in `/sda/banner/add`)
- Link images (in `/sda/linkimg/add`)

---

## Environment Variables to Add

Add these to `.env` (NEVER expose in frontend):

```
# Firebase Admin SDK (get from Firebase Console → Service Accounts)
FIREBASE_PROJECT_ID=careersattech-d5495
FIREBASE_PRIVATE_KEY=<your-private-key>
FIREBASE_CLIENT_EMAIL=<your-client-email>

# Telegram (keep these SECRET)
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_CHANNEL_2022=<channel-id>
TELEGRAM_CHANNEL_2023=<channel-id>
TELEGRAM_CHANNEL_DEFAULT=<channel-id>

# Bitly (keep this SECRET)
BITLY_API_TOKEN=<your-token>
```

---

## Implementation Order (Recommended)

1. **Week 1:**
   - [ ] Set up Firebase Admin SDK
   - [ ] Create Telegram proxy endpoints (`/api/notify/telegram`, `/api/notify/telegram-photo`)
   - [ ] Create Bitly proxy endpoints (`/api/util/shorten`, `/api/util/link-clicks/:shortCode`)
   - [ ] Add file upload validation to existing endpoints
   - [ ] Keep old `x-api-key` check as fallback (log deprecation warning)

2. **Week 2:**
   - [ ] Implement Firebase token verification middleware
   - [ ] Apply to all endpoints
   - [ ] Test with updated frontend
   - [ ] Implement admin role verification

3. **Week 3:**
   - [ ] Remove old `x-api-key` fallback
   - [ ] **CRITICAL: Rotate all exposed credentials:**
     - Generate new API key
     - Generate new Telegram bot token
     - Generate new Bitly token
     - Generate new Firebase API key
   - [ ] Update `.env` in all environments
   - [ ] Redeploy

---

## Testing Checklist

Before merging:
- [ ] POST requests with valid Firebase token succeed
- [ ] POST requests without token return 401
- [ ] Admin endpoints return 403 for non-admin users
- [ ] Telegram messages are sent through backend endpoint
- [ ] Bitly URLs are shortened through backend endpoint
- [ ] File uploads with invalid MIME types are rejected with 400
- [ ] File uploads over size limit are rejected with 400
- [ ] Old `x-api-key` still works (shows deprecation warning in logs)

---

## Reference

- **Detailed Guide:** `BACKEND_SECURITY_REQUIREMENTS.md` (in repo)
- **Full Audit Report:** `/Users/jnanashish/.claude/plans/tranquil-hatching-toucan.md`
- **Frontend Fixes:** Deployed in commit `cdea5f9`

---

## Questions

Refer to `BACKEND_SECURITY_REQUIREMENTS.md` for:
- Complete code examples for each endpoint
- Middleware implementation patterns
- Error handling specifications
- Security considerations

---

**Status:** Frontend ready ✅ | Backend implementation needed 🔴

