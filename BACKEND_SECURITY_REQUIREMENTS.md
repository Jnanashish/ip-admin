# Backend Security Implementation — Firebase Only

## Context

The frontend security audit identified a critical vulnerability: the static API key is visible in the JavaScript bundle. We need to implement Firebase ID token authentication on the backend to secure all API endpoints.

**Status:** Frontend ready ✅ | Backend implementation needed 🔴

---

## Single Backend Change Required

### Replace Static API Key with Firebase ID Token Authentication

**CRITICAL PRIORITY**

#### Problem

**Current (Vulnerable):**
- Frontend sends: `x-api-key: REACT_APP_API_KEY`
- API key is visible in JS bundle (anyone with DevTools can extract it)
- Anyone can call the API directly without proper authentication

**Why This Matters:**
- The API key is a static, shared secret used for ALL requests
- No way to know who made a request
- No ability to revoke access per user
- No audit trail of who did what

#### Solution

Replace with Firebase ID Token authentication:
- Each user gets a unique, time-limited token
- Tokens are cryptographically signed by Firebase
- Backend verifies tokens using Firebase Admin SDK
- Clear audit trail of who accessed what
- Easy to revoke access if needed

---

## Implementation Guide

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Initialize Firebase Admin

**Get your service account key:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select `careersattech-d5495` project
3. Settings (⚙️) → Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file

**Initialize in your backend:**

```javascript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-key.json')),
  projectId: 'careersattech-d5495'
});
```

### 3. Create Authentication Middleware

Create a middleware that verifies Firebase tokens:

```javascript
// src/middleware/firebaseAuth.js (or your path)

export const verifyFirebaseToken = async (req, reply) => {
  const authHeader = req.headers.authorization;
  
  // Check Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized: Missing or invalid Authorization header'
    });
  }
  
  // Extract token from "Bearer <token>"
  const token = authHeader.substring(7);
  
  try {
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user information to request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    
    // Continue to next handler
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return reply.code(401).send({
      error: 'Unauthorized: Invalid or expired token'
    });
  }
};
```

### 4. Apply Middleware to Protected Routes

Update each endpoint to use the middleware:

**Before:**
```javascript
app.post('/jd/add', async (req, reply) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return reply.code(401).send({ error: 'Invalid API key' });
  }
  // ... add job logic
});
```

**After:**
```javascript
app.post('/jd/add',
  { preHandler: verifyFirebaseToken },
  async (req, reply) => {
    // User info is now available
    console.log(`Job added by: ${req.firebaseUser.email}`);
    
    // ... add job logic (same as before)
  }
);
```

### 5. Apply to All Protected Endpoints

Add `{ preHandler: verifyFirebaseToken }` to all endpoints that modify data (POST, PUT, DELETE):

**Endpoints to update:**
```
POST   /jd/add
PUT    /jd/update/:id
DELETE /jd/delete/:id

POST   /companydetails/add
PUT    /companydetails/update/:id
DELETE /companydetails/delete/:id

POST   /sda/banner/add
DELETE /sda/banner/delete/:id

POST   /sda/link/add
DELETE /sda/link/delete/:id

POST   /sda/linkimg/add
DELETE /sda/linkimg/delete/:id
```

Read endpoints (GET) are your choice:
- Can remain completely open
- Or require authentication: `{ preHandler: verifyFirebaseToken }`

### 6. (Optional) Keep Old API Key as Fallback

For a 2-week grace period, you can accept both:

```javascript
export const verifyAuthLegacy = async (req, reply) => {
  // Try Firebase token first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      return; // Continue
    } catch (error) {
      // Fall through to check API key
    }
  }
  
  // Fallback to old API key (show deprecation warning)
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.API_KEY) {
    console.warn('⚠️  DEPRECATED: Using old x-api-key authentication. Please use Firebase tokens.');
    req.firebaseUser = { email: 'legacy-api-key', uid: 'legacy' };
    return; // Continue
  }
  
  return reply.code(401).send({ error: 'Unauthorized' });
};

// Use this instead of verifyFirebaseToken for 2 weeks
app.post('/jd/add',
  { preHandler: verifyAuthLegacy },
  async (req, reply) => { /* ... */ }
);
```

After 2 weeks, replace `verifyAuthLegacy` with `verifyFirebaseToken` everywhere.

### 7. Update Environment Variables

Add to your backend `.env`:

```env
# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=careersattech-d5495
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...[long key]...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@careersattech-d5495.iam.gserviceaccount.com

# OPTIONAL: Keep for 2-week grace period, then remove
API_KEY=<your-old-api-key>
```

---

## How the Frontend Works

**Frontend (Already Updated):**

1. User logs in with Firebase
2. Frontend gets ID token: `await auth.currentUser.getIdToken()`
3. Frontend sends all requests with: `Authorization: Bearer <token>`
4. Backend verifies token and processes request
5. If token expired, Firebase auto-refreshes before sending request

```javascript
// Frontend code (already implemented)
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API}/jd/add`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jobData)
});
```

---

## Testing

### Test 1: Request with Valid Token

```bash
# Get a valid token from frontend (from console: await firebase.auth().currentUser.getIdToken())
TOKEN="<paste-token-here>"

curl -X POST http://localhost:3000/jd/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job", "link": "https://example.com"}'

# Expected: 200 or validation error (NOT 401)
```

### Test 2: Request Without Token

```bash
curl -X POST http://localhost:3000/jd/add \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job"}'

# Expected: 401 Unauthorized
```

### Test 3: Request with Old API Key (if using fallback)

```bash
curl -X POST http://localhost:3000/jd/add \
  -H "x-api-key: <your-old-key>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job"}'

# Expected: 200 + deprecation warning in logs
```

### Test 4: Request with Invalid Token

```bash
curl -X POST http://localhost:3000/jd/add \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job"}'

# Expected: 401 Unauthorized
```

---

## Deployment Timeline

**Immediate (Same day/next day):**
1. [ ] Add Firebase Admin SDK
2. [ ] Create verifyFirebaseToken middleware
3. [ ] Apply to all POST/PUT/DELETE endpoints
4. [ ] Deploy to production
5. [ ] Keep old x-api-key check as fallback (with warning)

**Week 1:**
1. [ ] Monitor logs for successful Firebase token verifications
2. [ ] Ensure zero 401 errors from updated frontend
3. [ ] Confirm deprecation warnings appear in logs

**Week 2-3:**
1. [ ] Remove old x-api-key fallback completely
2. [ ] Rotate the old API key (generate new one, delete old one)
3. [ ] Update all `.env` files (remove old API_KEY)
4. [ ] Clean up environment variables

---

## Pre-Deployment Checklist

- [ ] Firebase Admin SDK installed
- [ ] Service account key obtained from Firebase Console
- [ ] Middleware created and tested locally
- [ ] Applied to all POST/PUT/DELETE endpoints
- [ ] GET endpoints updated (optional)
- [ ] 401 returned for missing tokens
- [ ] 401 returned for invalid tokens
- [ ] 200 returned for valid tokens
- [ ] User info available in req.firebaseUser
- [ ] Old API key fallback working (if using)
- [ ] Error messages logged properly

---

## Frontend Status

✅ Frontend already sends `Authorization: Bearer <firebaseIdToken>` header on all requests.

No frontend changes needed. It's ready to work with the new backend authentication.

---

## Rollback Plan

If something breaks:
1. Keep old x-api-key fallback active
2. Frontend can still use old auth temporarily
3. Debug the Firebase token verification
4. Re-deploy once fixed

---

## Questions?

Check `BACKEND_PROMPT.md` for a quick summary, or contact your team.
