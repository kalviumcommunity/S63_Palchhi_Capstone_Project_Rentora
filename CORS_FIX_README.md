# CORS Issue Fix

This document explains the changes made to fix the CORS (Cross-Origin Resource Sharing) issue between the frontend and backend.

## The Problem

The frontend (hosted at `https://magical-otter-cbb01e.netlify.app`) was unable to make requests to the backend (hosted at `https://s63-palchhi-capstone-project-rentora.onrender.com`) due to CORS restrictions. Specifically, the error was:

```
Access to XMLHttpRequest at 'https://s63-palchhi-capstone-project-rentora.onrender.com/auth/login' from origin 'https://magical-otter-cbb01e.netlify.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## The Solution

The following changes were made to fix the issue:

1. **Added Routes Without `/api` Prefix**:
   - The frontend was making requests to `/auth/login` but the backend was expecting `/api/auth/login`
   - Added duplicate routes without the `/api` prefix for backward compatibility

2. **Updated CORS Configuration**:
   - Set `origin: '*'` to allow requests from all origins (for debugging)
   - Simplified the CORS configuration to be more permissive

3. **Added Explicit OPTIONS Handler**:
   - Added a handler for OPTIONS requests to properly respond to preflight requests
   - Added logging to help debug CORS issues

4. **Added CORS Headers to All Responses**:
   - Added middleware to set CORS headers on all responses
   - Made sure the headers allow requests from the Netlify domain

5. **Added Testing Tools**:
   - Created a CORS test endpoint at `/cors-test`
   - Created a CORS test HTML page at `/test/cors-test.html`
   - Added a CORS fix script at `scripts/cors-fix.js`

## How to Test

1. **Use the CORS Test Page**:
   - Visit `https://s63-palchhi-capstone-project-rentora.onrender.com/test/cors-test.html`
   - Click the buttons to test different endpoints
   - Check the results to see if CORS is working

2. **Run the CORS Fix Script**:
   ```
   cd backend
   npm run cors-fix
   ```

3. **Check the Frontend**:
   - Try logging in on the frontend
   - Check the browser console for any CORS errors

## Deployment

1. **Push the Changes**:
   - Commit and push all the changes to your repository

2. **Update Environment Variables**:
   - Make sure the following environment variables are set on your server:
     - `FRONTEND_URL=https://magical-otter-cbb01e.netlify.app`
     - `CLIENT_URL=https://magical-otter-cbb01e.netlify.app`
     - `ALLOWED_ORIGINS=https://magical-otter-cbb01e.netlify.app,https://s63-palchhi-capstone-project-rentora.onrender.com,http://localhost:3000`

3. **Restart the Server**:
   - Restart your backend server to apply the changes

## Long-Term Solution

Once the CORS issue is fixed and everything is working, you should:

1. **Restrict CORS to Specific Origins**:
   - Update the CORS configuration to only allow requests from trusted origins
   - Replace `origin: '*'` with a list of allowed origins

2. **Update the Frontend**:
   - Consider updating the frontend to use the `/api` prefix consistently
   - This would allow you to remove the duplicate routes in the backend

3. **Monitor for CORS Issues**:
   - Keep an eye on the server logs for any CORS-related errors
   - Use the CORS test page to verify that CORS is still working after any changes