# Backend Security Implementation Requirements

## Context

A comprehensive security audit of the ip-admin frontend identified critical vulnerabilities that require backend changes. The frontend has already been patched with client-side mitigations, but these backend changes are essential for proper authentication, authorization, and API security.

**Status:** Frontend fixes deployed ✅ | Backend changes needed 🔴

---

## Critical Issues Requiring Backend Changes

### 1. Replace Static API Key with Firebase ID Token Authentication

**CRITICAL PRIORITY**

**Current State (Vulnerable):**
- Frontend sends requests with `x-api-key: REACT_APP_API_KEY` header
- This key is hardcoded, static, and visible in the JS bundle
- Anyone can extract it from DevTools and call any API endpoint

**Required Change:**
All API endpoints must authenticate using Firebase ID tokens instead of the static API key.

#### Implementation Details:

**Frontend Behavior (Already Implemented):**
- Client will send: `Authorization: Bearer <firebaseIdToken>` header
- Token is obtained via: `await auth.currentUser.getIdToken()`
- Token is fresh (Firebase auto-refreshes before expiry)

**What Backend Needs to Do:**

1. **Install Firebase Admin SDK** (if not already done):
   ```bash
   npm install firebase-admin
   # or
   pip install firebase-admin  # if using Python
   ```

2. **Initialize Firebase Admin in your app:**
   ```javascript
   // Node.js/Fastify example
   import admin from 'firebase-admin';
   
   admin.initializeApp({
     credential: admin.credential.cert(require('./firebase-key.json')),
     projectId: 'careersattech-d5495' // from .env
   });
   ```

3. **Create auth middleware to verify tokens:**
   ```javascript
   // src/middleware/firebaseAuth.js (or equivalent)
   export const verifyFirebaseToken = async (req, reply) => {
     const authHeader = req.headers.authorization;
     
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return reply.code(401).send({ error: 'Unauthorized: Missing or invalid token' });
     }
     
     const token = authHeader.substring(7); // Remove 'Bearer ' prefix
     
     try {
       const decodedToken = await admin.auth().verifyIdToken(token);
       req.firebaseUser = {
         uid: decodedToken.uid,
         email: decodedToken.email,
       };
     } catch (error) {
       console.error('Token verification failed:', error);
       return reply.code(401).send({ error: 'Unauthorized: Invalid token' });
     }
   };
   ```

4. **Apply middleware to all routes:**
   - Remove the old `x-api-key` header check
   - Apply `verifyFirebaseToken` as a `preHandler` hook on all protected routes
   - Allow `GET /health` and sign-in endpoints to skip auth
   - All `POST`, `PUT`, `DELETE` endpoints require auth

5. **Example: Update a job endpoint**
   ```javascript
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
       // req.firebaseUser is now available
       console.log(`Job added by user: ${req.firebaseUser.email}`);
       // ... add job logic
     }
   );
   ```

6. **Deprecate the static API key:**
   - Keep the old `x-api-key` check as a fallback for 1-2 weeks (for backward compatibility)
   - Log a deprecation warning each time it's used
   - After grace period, remove it entirely
   - Delete the `REACT_APP_API_KEY` from all `.env` files

---

### 2. Move Telegram API Calls to Backend Proxy

**HIGH PRIORITY**

**Current State (Vulnerable):**
- Frontend sends direct requests to `api.telegram.org`
- Telegram Bot token is in the JS bundle (visible to all users)
- Anyone can send messages to your Telegram channels

**Required Change:**
Create a backend endpoint that forwards Telegram requests.

#### Implementation Details:

**Create two new endpoints:**

1. **`POST /api/notify/telegram`** — Send text message to Telegram channel

   **Request Body:**
   ```json
   {
     "title": "Job Title",
     "batch": "2024",
     "degree": "B.Tech",
     "link": "https://example.com/apply"
   }
   ```

   **Response:**
   ```json
   {
     "success": true,
     "messageId": 12345
   }
   ```

   **Backend Logic:**
   ```javascript
   app.post('/api/notify/telegram',
     { preHandler: verifyFirebaseToken },
     async (req, reply) => {
       const { title, batch, degree, link } = req.body;
       
       // Validate inputs
       if (!title || !batch || !degree || !link) {
         return reply.code(400).send({ error: 'Missing required fields' });
       }
       
       // Determine which channel based on batch
       let channelId;
       if (batch.includes('2022')) {
         channelId = process.env.TELEGRAM_CHANNEL_2022;
       } else if (batch.includes('2023')) {
         channelId = process.env.TELEGRAM_CHANNEL_2023;
       } else {
         channelId = process.env.TELEGRAM_CHANNEL_DEFAULT;
       }
       
       const botToken = process.env.TELEGRAM_BOT_TOKEN; // Secret, not in frontend
       const message = `${title}\n\nBatch: ${batch}\n\nDegree: ${degree}\n\nApply: ${link}`;
       
       try {
         const response = await fetch(
           `https://api.telegram.org/bot${botToken}/sendMessage`,
           {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               chat_id: channelId,
               text: message,
               disable_web_page_preview: true,
               disable_notification: true
             })
           }
         );
         
         if (!response.ok) {
           throw new Error(`Telegram API error: ${response.statusText}`);
         }
         
         const data = await response.json();
         return reply.code(200).send({ success: true, messageId: data.result.message_id });
       } catch (error) {
         console.error('Telegram API error:', error);
         return reply.code(500).send({ error: 'Failed to send message' });
       }
     }
   );
   ```

2. **`POST /api/notify/telegram-photo`** — Send photo with caption to Telegram

   **Request Body:**
   ```json
   {
     "title": "Job Title",
     "link": "https://example.com/apply",
     "photoUrl": "https://cdn.example.com/banner.png"
   }
   ```

   **Response:**
   ```json
   {
     "success": true,
     "messageId": 12345
   }
   ```

**Frontend Changes (Already Done):**
Frontend now calls:
```javascript
// Instead of calling Telegram API directly
await fetch(`${API}/notify/telegram`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title, batch, degree, link })
});
```

---

### 3. Move Bitly API Calls to Backend Proxy

**HIGH PRIORITY**

**Current State (Vulnerable):**
- Frontend sends direct requests to `api-ssl.bitly.com`
- Bitly Bearer token is in the JS bundle
- Anyone can use your Bitly account quota

**Required Change:**
Create backend endpoints for URL shortening.

#### Implementation Details:

**Create two new endpoints:**

1. **`POST /api/util/shorten`** — Shorten a URL

   **Request Body:**
   ```json
   {
     "longUrl": "https://example.com/apply/very/long/path"
   }
   ```

   **Response:**
   ```json
   {
     "shortUrl": "https://bit.ly/abc123",
     "link": "https://bit.ly/abc123"
   }
   ```

   **Backend Logic:**
   ```javascript
   app.post('/api/util/shorten',
     { preHandler: verifyFirebaseToken },
     async (req, reply) => {
       const { longUrl } = req.body;
       
       if (!longUrl || typeof longUrl !== 'string') {
         return reply.code(400).send({ error: 'Invalid URL' });
       }
       
       // Validate URL format
       try {
         new URL(longUrl);
       } catch (error) {
         return reply.code(400).send({ error: 'Invalid URL format' });
       }
       
       const bitlyToken = process.env.BITLY_API_TOKEN; // Secret, not in frontend
       
       try {
         const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${bitlyToken}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({ long_url: longUrl })
         });
         
         if (!response.ok) {
           throw new Error(`Bitly API error: ${response.statusText}`);
         }
         
         const data = await response.json();
         return reply.code(200).send({ 
           shortUrl: data.link,
           link: data.link
         });
       } catch (error) {
         console.error('Bitly API error:', error);
         return reply.code(500).send({ error: 'Failed to shorten URL' });
       }
     }
   );
   ```

2. **`GET /api/util/link-clicks/:shortCode`** — Get click count for shortened URL

   **Response:**
   ```json
   {
     "clicks": 42,
     "shortUrl": "https://bit.ly/abc123"
   }
   ```

**Frontend Changes (Already Done):**
Frontend now calls:
```javascript
const response = await fetch(`${API}/util/shorten`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ longUrl: url })
});
```

---

### 4. Implement Backend Authorization: Verify Admin Role

**MEDIUM PRIORITY**

**Current State (Vulnerable):**
- Admin role determined on frontend by comparing email to `REACT_APP_ADMIN_EMAIL`
- No server-side verification
- Anyone with a valid Firebase token could potentially modify data

**Required Change:**
Backend must verify user is admin before allowing sensitive operations.

#### Implementation Details:

**Option A: Store admin email in database**

```javascript
// Create a table/collection: admins
// { email: "admin@example.com", userId: "firebase-uid" }

const verifyAdmin = async (req, reply) => {
  if (!req.firebaseUser) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  const adminList = await db.collection('admins').findOne({ 
    email: req.firebaseUser.email 
  });
  
  if (!adminList) {
    return reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }
};
```

**Option B: Use Firebase Custom Claims (Recommended)**

1. Set custom claims when user is promoted to admin:
   ```javascript
   // Run this once per admin user
   await admin.auth().setCustomUserClaims('uid-of-admin', { isAdmin: true });
   ```

2. Check claims in middleware:
   ```javascript
   const verifyAdmin = async (req, reply) => {
     if (!req.firebaseUser) {
       return reply.code(401).send({ error: 'Unauthorized' });
     }
     
     if (!req.firebaseUser.isAdmin) {
       return reply.code(403).send({ error: 'Forbidden: Admin access required' });
     }
   };
   ```

3. Update token verification middleware:
   ```javascript
   const verifyFirebaseToken = async (req, reply) => {
     const authHeader = req.headers.authorization;
     
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return reply.code(401).send({ error: 'Unauthorized' });
     }
     
     const token = authHeader.substring(7);
     
     try {
       const decodedToken = await admin.auth().verifyIdToken(token);
       req.firebaseUser = {
         uid: decodedToken.uid,
         email: decodedToken.email,
         isAdmin: decodedToken.isAdmin || false, // Include custom claim
       };
     } catch (error) {
       return reply.code(401).send({ error: 'Unauthorized: Invalid token' });
     }
   };
   ```

4. Apply to sensitive endpoints:
   ```javascript
   // Add a job (requires admin)
   app.post('/jd/add',
     { preHandler: [verifyFirebaseToken, verifyAdmin] },
     async (req, reply) => {
       // ... add job
     }
   );
   
   // Get job (anyone authenticated can read)
   app.get('/jd/:id',
     { preHandler: verifyFirebaseToken },
     async (req, reply) => {
       // ... get job
     }
   );
   ```

**Apply `verifyAdmin` to these endpoints:**
- `POST /jd/add` — Add job
- `PUT /jd/update/:id` — Update job
- `DELETE /jd/delete/:id` — Delete job
- `POST /companydetails/add` — Add company
- `PUT /companydetails/update/:id` — Update company
- `DELETE /companydetails/delete/:id` — Delete company
- `POST /sda/banner/add` — Add banner
- `DELETE /sda/banner/delete/:id` — Delete banner
- `POST /sda/link/add` — Add link
- `DELETE /sda/link/delete/:id` — Delete link
- `POST /sda/linkimg/add` — Add link with image
- `DELETE /sda/linkimg/delete/:id` — Delete link with image

---

### 5. Server-Side File Upload Validation

**MEDIUM PRIORITY**

**Current State (Vulnerable):**
- File type validation only on frontend (easily bypassed)
- File size limits only on frontend
- No server-side MIME type checking

**Required Change:**
All file uploads must be validated on the backend.

#### Implementation Details:

**Add validation to all file upload endpoints:**

```javascript
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const validateFileUpload = async (file, options = {}) => {
  const {
    allowedMimes = ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
  } = options;
  
  // Check file size
  if (file.size > maxSizeBytes) {
    throw new Error(`File too large: ${file.size} > ${maxSizeBytes}`);
  }
  
  // Check MIME type
  const fileMime = file.mimetype || 'application/octet-stream';
  if (!allowedMimes.includes(fileMime)) {
    throw new Error(`Invalid file type: ${fileMime}`);
  }
  
  // Optional: Check file signature (magic bytes) to prevent disguised files
  // This prevents renamed .exe files or SVG with script tags
  const buffer = await file.toBuffer();
  const signature = buffer.slice(0, 12).toString('hex');
  
  // JPEG: FFD8FF
  // PNG: 89504E47
  // WebP: RIFF...WEBP
  const validSignatures = {
    'image/jpeg': /^ffd8ff/i,
    'image/png': /^89504e47/i,
    'image/webp': /^52494646.*5745425020/i,
  };
  
  const expectedSig = validSignatures[fileMime];
  if (expectedSig && !expectedSig.test(signature)) {
    throw new Error('Invalid file signature: File is not a valid image');
  }
};

// Example: Update company logo endpoint
app.post('/companydetails/update-logo/:id',
  { preHandler: [verifyFirebaseToken, verifyAdmin] },
  async (req, reply) => {
    const { id } = req.params;
    const file = await req.file();
    
    if (!file) {
      return reply.code(400).send({ error: 'No file provided' });
    }
    
    try {
      // Validate file
      await validateFileUpload(file, {
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeBytes: 500 * 1024, // 500KB for logos
      });
      
      // Upload to Cloudinary or your CDN
      const uploadedUrl = await uploadToCloudinary(file);
      
      // Save URL to database
      await updateCompanyLogo(id, uploadedUrl);
      
      return reply.code(200).send({ logoUrl: uploadedUrl });
    } catch (error) {
      console.error('File upload error:', error);
      return reply.code(400).send({ error: error.message });
    }
  }
);
```

**Apply to these endpoints:**
- `POST /companydetails/add` — company logos
- `PUT /companydetails/update/:id` — company logos
- `POST /jd/add` — job banners
- `PUT /jd/update/:id` — job banners
- `POST /sda/banner/add` — promotional banners
- `POST /sda/linkimg/add` — link banners

---

## Environment Variables Required

Add these to your `.env` file (do NOT expose in frontend):

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=careersattech-d5495
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@careersattech-d5495.iam.gserviceaccount.com

# Third-party API keys (keep secret)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_2022=your_channel_id_here
TELEGRAM_CHANNEL_2023=your_channel_id_here
TELEGRAM_CHANNEL_DEFAULT=your_channel_id_here

BITLY_API_TOKEN=your_bitly_token_here

# Optional: Remove the old static key after migration
# REACT_APP_API_KEY=xxx (deprecated, remove after 2 weeks)
```

---

## Migration Timeline

1. **Week 1:**
   - Deploy Firebase Admin SDK initialization
   - Implement new endpoints for Telegram and Bitly
   - Implement file upload validation
   - Keep old `x-api-key` check as fallback (log deprecation warnings)
   - Update frontend to use new endpoints (already done in this PR)

2. **Week 2:**
   - Deploy Firebase token verification on all endpoints
   - Test that all frontend requests work with new auth
   - Deploy admin role verification

3. **Week 3:**
   - Remove old `x-api-key` fallback
   - Rotate all exposed credentials (API key, bot token, Bitly token)
   - Monitor logs for any compatibility issues

---

## Testing Checklist

- [ ] Firebase token verification works for all authenticated endpoints
- [ ] 401 Unauthorized returned for missing/invalid tokens
- [ ] 403 Forbidden returned for non-admin users on admin endpoints
- [ ] Telegram messages are sent through backend proxy
- [ ] Bitly URLs are shortened through backend proxy
- [ ] File uploads rejected for wrong MIME types
- [ ] File uploads rejected for files over size limit
- [ ] Old `x-api-key` still works (with deprecation warning)
- [ ] All tests pass

---

## Questions?

Reference the frontend security audit summary at: `/Users/jnanashish/Documents/personal/ip-admin/SECURITY_FIXES_SUMMARY.md`

For more details on what prompted these changes, see: `/Users/jnanashish/.claude/plans/tranquil-hatching-toucan.md`
