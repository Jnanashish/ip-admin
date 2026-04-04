# Backend Security Implementation Prompt — Firebase Only

Copy and paste this for your backend engineer:

---

## 🔒 Implement Firebase ID Token Authentication

### Context

The frontend team completed a security audit. We need to update the backend to use Firebase ID token authentication instead of the current static `x-api-key` header.

**Priority: Critical** — Deploy ASAP

---

## Task: Replace Static API Key with Firebase ID Token Authentication

### What & Why

**Current (Vulnerable):**
- All API requests use `x-api-key: REACT_APP_API_KEY` header
- The API key is hardcoded and visible in the JS bundle
- Anyone can extract it from DevTools and call the API directly

**Required:**
- Accept `Authorization: Bearer <firebaseIdToken>` header on all requests
- Verify the token using Firebase Admin SDK
- Return 401 Unauthorized for invalid/missing tokens
- Keep old `x-api-key` check as fallback for 1-2 weeks (with deprecation warning)
- After 2 weeks, remove the old check and rotate the API key

---

## Implementation Steps

### Step 1: Set Up Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Initialize Firebase Admin

```javascript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-key.json')),
  projectId: 'careersattech-d5495'
});
```

**Get firebase-key.json from:**
1. Go to Firebase Console (console.firebase.google.com)
2. careersattech-d5495 project → Settings → Service Accounts
3. Generate a new private key (download as JSON)
4. Add to your backend `.env` or secure config

### Step 3: Create Authentication Middleware

```javascript
// src/middleware/firebaseAuth.js (or similar)

export const verifyFirebaseToken = async (req, reply) => {
  const authHeader = req.headers.authorization;
  
  // Check header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ 
      error: 'Unauthorized: Missing or invalid token' 
    });
  }
  
  // Extract token
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return reply.code(401).send({ 
      error: 'Unauthorized: Invalid token' 
    });
  }
};
```

### Step 4: Apply Middleware to All Protected Routes

```javascript
// Example: Job endpoints

// Before:
app.post('/jd/add', async (req, reply) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return reply.code(401).send({ error: 'Invalid API key' });
  }
  // ... add job logic
});

// After:
app.post('/jd/add',
  { preHandler: verifyFirebaseToken },
  async (req, reply) => {
    console.log(`Job added by: ${req.firebaseUser.email}`);
    // ... add job logic
  }
);
```

**Apply to ALL these endpoints:**
- `POST /jd/add`
- `PUT /jd/update/:id`
- `DELETE /jd/delete/:id`
- `POST /companydetails/add`
- `PUT /companydetails/update/:id`
- `DELETE /companydetails/delete/:id`
- `POST /sda/banner/add`
- `DELETE /sda/banner/delete/:id`
- `POST /sda/link/add`
- `DELETE /sda/link/delete/:id`
- `POST /sda/linkimg/add`
- `DELETE /sda/linkimg/delete/:id`
- Any other endpoint that modifies data

**Read endpoints (GET) can remain unauthenticated or require only token verification without the middleware, your choice.**

### Step 5: Add Fallback for Old API Key (Optional, for 2-week grace period)

```javascript
// Optional: Keep old x-api-key check as fallback
const verifyAuthLegacy = async (req, reply) => {
  // Try Firebase token first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return verifyFirebaseToken(req, reply);
  }
  
  // Fallback to old API key (show deprecation warning)
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.API_KEY) {
    console.warn('DEPRECATED: x-api-key authentication used. Switch to Firebase tokens.');
    req.firebaseUser = { email: 'api-key-user', uid: 'api-key' };
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

### Step 6: Remove Old Check After 2 Weeks

After 2 weeks:
1. Remove all `verifyAuthLegacy` references
2. Use only `verifyFirebaseToken`
3. Rotate/delete the old `REACT_APP_API_KEY`

---

## Environment Variables

Add to your backend `.env`:

```env
# Firebase Admin SDK credentials (from Service Accounts page)
FIREBASE_PROJECT_ID=careersattech-d5495
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@careersattech-d5495.iam.gserviceaccount.com

# OPTIONAL: Keep for 2-week grace period, then remove
API_KEY=<old-key>
```

---

## Testing

### Manual Testing

1. **Get a Firebase token (from frontend):**
   ```javascript
   const token = await firebase.auth().currentUser.getIdToken();
   console.log(token);
   ```

2. **Test endpoint with token:**
   ```bash
   curl -X POST http://localhost:3000/jd/add \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Job"}'
   ```
   Expected: 200 Success (or validation error, but not 401)

3. **Test without token:**
   ```bash
   curl -X POST http://localhost:3000/jd/add
   ```
   Expected: 401 Unauthorized

4. **Test with old API key (if using fallback):**
   ```bash
   curl -X POST http://localhost:3000/jd/add \
     -H "x-api-key: <old-key>"
   ```
   Expected: 200 Success + deprecation warning in logs

---

## Deployment Timeline

1. **Day 1:** Deploy Firebase token verification
   - Apply to all endpoints
   - Keep old `x-api-key` as fallback (with warning)
   - Monitor logs for any issues

2. **Week 1:** Verify all frontend requests work
   - Test with updated frontend
   - Ensure no 401 errors in production logs

3. **Week 2-3:** Remove old API key
   - Remove the fallback check
   - Rotate the old API key
   - Delete from all `.env` files

---

## Checklist

Before deploying:
- [ ] Firebase Admin SDK installed
- [ ] Firebase service account key configured
- [ ] Middleware created and tested
- [ ] Applied to all modifying endpoints (POST, PUT, DELETE)
- [ ] 401 returned for missing/invalid tokens
- [ ] 200 returned for valid tokens
- [ ] User info available in `req.firebaseUser`
- [ ] Old `x-api-key` fallback working (if using)

---

## Frontend Status

✅ **Already Updated** — Frontend now sends:
```
Authorization: Bearer <firebaseIdToken>
```

Frontend is ready to use the new authentication. No changes needed there.

---

## Questions?

Refer to `BACKEND_SECURITY_REQUIREMENTS.md` for more detailed examples and error handling patterns.

