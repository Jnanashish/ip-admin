# CORS Configuration Fix — Backend Prompt

Share this with your backend engineer:

---

## Problem: CORS Errors from Frontend

**Symptom:** Frontend sends requests with correct API key (`x-api-key` header), but gets CORS errors:

```
Access to XMLHttpRequest at 'https://your-api.com/jd/add' 
from origin 'https://yoursite.netlify.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check
```

**Root Cause:** Backend is not configured to accept requests from the frontend's origin (domain).

**Solution:** Add CORS headers to backend.

---

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature. Browsers block requests to different domains unless the backend explicitly allows them.

**Example:**
- Frontend is at: `https://yoursite.netlify.app`
- Backend is at: `https://api.careersattech.com`
- These are different origins → CORS protection kicks in
- Backend must tell browser: "Yes, this frontend is allowed"

---

## Fix: Add CORS Configuration to Backend

Choose your backend framework below:

### Option 1: Node.js + Fastify

**Install CORS package:**
```bash
npm install @fastify/cors
```

**Register CORS plugin:**
```javascript
// src/app.js or wherever you initialize Fastify

import fastify from 'fastify';
import cors from '@fastify/cors';

const app = fastify();

// Add CORS BEFORE registering routes
await app.register(cors, {
  origin: [
    'http://localhost:3000',                    // Local development
    'https://yoursite.netlify.app',             // YOUR Netlify domain (change this!)
    'https://careersattech.com',                // Production domain (if any)
  ],
  credentials: true,                            // Allow credentials (cookies, auth headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-api-key',
    'Accept'
  ],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400,                                // Cache preflight for 24 hours
});

// Now register your routes
app.register(require('./routes/jobs'));
app.register(require('./routes/companies'));
// ... etc

export default app;
```

### Option 2: Node.js + Express

**Install CORS package:**
```bash
npm install cors
```

**Add CORS middleware:**
```javascript
// src/app.js or wherever you initialize Express

import express from 'express';
import cors from 'cors';

const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',                    // Local development
    'https://yoursite.netlify.app',             // YOUR Netlify domain (change this!)
    'https://careersattech.com',                // Production domain (if any)
  ],
  credentials: true,                            // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-api-key',
    'Accept'
  ],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,                    // Some legacy browsers choke on 204
  maxAge: 86400,                                // Cache preflight for 24 hours
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Now add your routes
app.post('/jd/add', (req, res) => { /* ... */ });
app.put('/jd/update/:id', (req, res) => { /* ... */ });
// ... etc

export default app;
```

### Option 3: Node.js + Hapi

**Install CORS package:**
```bash
npm install hapi-cors
```

**Configure CORS:**
```javascript
// src/app.js

import Hapi from '@hapi/hapi';
import HapiCors from 'hapi-cors';

const server = Hapi.server({
  port: 3000,
  host: 'localhost',
  routes: {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://yoursite.netlify.app',
        'https://careersattech.com',
      ],
      credentials: true,
      headers: [
        'Content-Type',
        'Authorization',
        'x-api-key',
        'Accept'
      ],
      maxAge: 86400,
    }
  }
});

export default server;
```

### Option 4: Python + Flask

**Install CORS package:**
```bash
pip install flask-cors
```

**Add CORS configuration:**
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS
CORS(app, 
     origins=[
         'http://localhost:3000',
         'https://yoursite.netlify.app',
         'https://careersattech.com',
     ],
     allow_headers=[
         'Content-Type',
         'Authorization',
         'x-api-key',
         'Accept'
     ],
     supports_credentials=True,
     max_age=86400
)

@app.route('/jd/add', methods=['POST'])
def add_job():
    # Your logic here
    return {'success': True}

if __name__ == '__main__':
    app.run()
```

### Option 5: Python + Django

**Install CORS package:**
```bash
pip install django-cors-headers
```

**Update settings.py:**
```python
INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this BEFORE common middleware
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://yoursite.netlify.app',
    'https://careersattech.com',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'Content-Type',
    'Authorization',
    'x-api-key',
    'Accept',
]

CORS_EXPOSE_HEADERS = [
    'Content-Type',
]

CORS_MAX_AGE = 86400
```

### Option 6: Python + FastAPI

**Install CORS package:**
```bash
pip install fastapi
# CORS is built-in to FastAPI
```

**Add CORS middleware:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',
        'https://yoursite.netlify.app',
        'https://careersattech.com',
    ],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allow_headers=[
        'Content-Type',
        'Authorization',
        'x-api-key',
        'Accept',
    ],
    expose_headers=['Content-Type'],
    max_age=86400,
)

@app.post('/jd/add')
async def add_job():
    # Your logic here
    return {'success': True}
```

---

## Important: Replace with Your Actual Domain

**Before deploying, change these:**

```javascript
// ❌ WRONG - Generic example
origin: ['https://yoursite.netlify.app']

// ✅ RIGHT - Your actual Netlify domain
origin: ['https://ip-admin-app.netlify.app']  // Example - use YOUR domain
```

**Find your Netlify domain:**
1. Go to Netlify dashboard
2. Your project → Settings → General → Site details
3. Your site URL is listed there (e.g., `https://happy-elephant-abc123.netlify.app`)
4. Use that exact URL in the CORS config

---

## Configuration Explained

| Setting | What It Does | Example |
|---------|-------------|---------|
| `origin` | Allowed frontend domains | `['https://yoursite.netlify.app']` |
| `credentials: true` | Allow sending auth headers | Needed for x-api-key and Authorization |
| `methods` | Allowed HTTP methods | `['GET', 'POST', 'PUT', 'DELETE']` |
| `allowedHeaders` | Headers frontend can send | `['x-api-key', 'Authorization']` |
| `exposedHeaders` | Headers frontend can read | Usually not needed for your use case |
| `maxAge` | How long to cache preflight check | `86400` = 24 hours |

---

## Testing After Deployment

### Test 1: Simple GET request

```bash
curl -X GET https://your-backend-api.com/jd/all \
  -H "Origin: https://yoursite.netlify.app"

# Should return data without CORS error
```

### Test 2: POST with x-api-key

```bash
curl -X POST https://your-backend-api.com/jd/add \
  -H "Origin: https://yoursite.netlify.app" \
  -H "x-api-key: 26896e0ac46beec8e4baaf16e1f33c0068f98953c30f3cc838c9d773f8a0c421" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job"}'

# Should succeed without CORS error
```

### Test 3: Check preflight response

```bash
curl -X OPTIONS https://your-backend-api.com/jd/add \
  -H "Origin: https://yoursite.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: x-api-key, Content-Type" \
  -v

# Should return:
# Access-Control-Allow-Origin: https://yoursite.netlify.app
# Access-Control-Allow-Methods: POST
# Access-Control-Allow-Headers: x-api-key, Content-Type
```

### Test 4: Open browser DevTools

1. Go to your Netlify site in browser
2. Open DevTools (F12) → Console
3. Try adding a job
4. Should see 200 OK response (or validation error, but not CORS error)

---

## Common Mistakes

### ❌ Wrong: Using * for origin in production
```javascript
// INSECURE - allows ANY domain to call your API
origin: '*'
```

### ✅ Right: Specify exact domains
```javascript
// SECURE - only these domains can call API
origin: [
  'https://yoursite.netlify.app',
  'https://careersattech.com'
]
```

---

### ❌ Wrong: Forgetting credentials: true
```javascript
// Won't send authentication headers
cors: {
  origin: ['https://yoursite.netlify.app'],
  // credentials missing!
}
```

### ✅ Right: Include credentials
```javascript
// Will send auth headers properly
cors: {
  origin: ['https://yoursite.netlify.app'],
  credentials: true,  // ← Important!
}
```

---

### ❌ Wrong: Missing x-api-key in allowedHeaders
```javascript
allowedHeaders: ['Content-Type', 'Authorization']
// Frontend sends x-api-key but it's not allowed!
```

### ✅ Right: Include all headers frontend sends
```javascript
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'x-api-key',  // ← Include this!
]
```

---

## Deployment Checklist

- [ ] CORS package installed (`@fastify/cors`, `cors`, `flask-cors`, etc.)
- [ ] CORS middleware/plugin added BEFORE routes are defined
- [ ] `origin` list includes your Netlify domain
- [ ] `origin` list includes `http://localhost:3000` for local dev
- [ ] `credentials: true` is set
- [ ] `allowedHeaders` includes `'x-api-key'`
- [ ] `allowedHeaders` includes `'Authorization'`
- [ ] `allowedHeaders` includes `'Content-Type'`
- [ ] `methods` includes `['GET', 'POST', 'PUT', 'DELETE']`
- [ ] Code is deployed to production
- [ ] Tested with browser DevTools (no CORS errors)
- [ ] Tested with curl from command line
- [ ] Frontend can now make requests

---

## If Still Getting CORS Errors

### Step 1: Check error message in browser console

```
Access to XMLHttpRequest at 'https://api.careersattech.com/jd/add' 
from origin 'https://yoursite.netlify.app' has been blocked by CORS policy
```

### Step 2: Verify what's blocked

Usually it says one of:
- "Missing header" → Add to `allowedHeaders`
- "Missing method" → Add to `methods`
- "Origin not allowed" → Add to `origin` list
- "Credentials not allowed" → Set `credentials: true`

### Step 3: Check deployed code

1. Verify CORS code is in your deployed version (not just local)
2. Restart/redeploy your backend service
3. Check that you're calling the deployed backend URL (not localhost)

### Step 4: Debug request headers

In browser DevTools:
1. Open Network tab
2. Look for failed requests
3. Click on request → Headers tab
4. Look at `Request Headers` section
5. Check what headers are being sent
6. Compare with `allowedHeaders` in your CORS config

### Step 5: Check preflight response

For POST/PUT/DELETE requests, browser sends an OPTIONS preflight first:
1. In Network tab, look for request with method "OPTIONS"
2. Click it → Response Headers
3. Should see `Access-Control-Allow-Origin: https://yoursite.netlify.app`
4. Should see `Access-Control-Allow-Headers: x-api-key, Content-Type, Authorization`

If preflight fails, actual request won't be sent.

---

## What CORS Headers Should Look Like

**Successful CORS response from backend should include:**

```
Access-Control-Allow-Origin: https://yoursite.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

If any of these are missing, CORS will fail.

---

## FAQ

**Q: Why is CORS needed?**
A: Security. Browsers block cross-domain requests by default to prevent malicious scripts from accessing other domains.

**Q: Does this expose my API?**
A: No. CORS only allows the browser to make requests. It doesn't change backend security. Authentication (API key, tokens) still protects your endpoints.

**Q: Can I use * for origin?**
A: Not recommended. `*` allows any domain to call your API. Better to whitelist specific domains.

**Q: Do GET requests need CORS?**
A: Yes, if frontend and backend are on different domains.

**Q: Does this work with API key authentication?**
A: Yes! CORS allows the request to be sent. Authentication (x-api-key) still validates it.

**Q: How long do I need to keep localhost in origin list?**
A: Only while developing locally. Remove before production if you want.

---

## Production Checklist

Before going to production:

- [ ] Only production domain in `origin` list (remove localhost)
- [ ] `credentials: true` is set
- [ ] All necessary headers in `allowedHeaders`
- [ ] No wildcard `*` origin (unless intentional)
- [ ] Backend is deployed
- [ ] CORS config is in deployed code
- [ ] Tested from production frontend domain
- [ ] No CORS errors in production browser console

---

**Deploy these CORS changes and let frontend know once it's live!**

Frontend will then be able to call your API without CORS errors.
