# Deployment Connection Setup

## Changes Made

### 1. Frontend Configuration
- Created `.env` file in `frontend/client/.env` with:
  ```
  VITE_API_URL=https://s63-palchhi-capstone-project-rentora.onrender.com
  ```

### 2. Netlify Build Configuration
- Updated `netlify.toml` to include the backend URL as an environment variable:
  ```toml
  [build.environment]
    NODE_VERSION = "18"
    VITE_API_URL = "https://s63-palchhi-capstone-project-rentora.onrender.com"
  ```

### 3. Backend CORS Configuration
- Cleaned up backend `.env` file by removing trailing slashes from URLs
- Backend is already configured to accept requests from your frontend URL

## How It Works

1. **Frontend API Calls**: Your frontend now uses `VITE_API_URL` to make API calls to your Render backend
2. **CORS Protection**: Backend allows requests from your Netlify frontend URL
3. **Socket.IO Connection**: Real-time chat features will connect to your deployed backend
4. **Authentication**: JWT tokens work across both deployed environments

## Next Steps

1. **Redeploy Frontend**: Push these changes to your repository to trigger a new Netlify build
2. **Verify Backend**: Ensure your Render backend is running and accessible
3. **Test Connection**: After redeployment, test the following:
   - User registration/login
   - Property listings
   - Chat functionality
   - Real-time notifications

## URLs Configuration Summary

- **Frontend**: https://magical-otter-cbb01e.netlify.app
- **Backend**: https://s63-palchhi-capstone-project-rentora.onrender.com
- **Database**: MongoDB Atlas (already configured)

## Troubleshooting

If you encounter CORS errors:
1. Check that both services are running
2. Verify URLs match exactly (no trailing slashes)
3. Check browser console for specific error messages

If API calls fail:
1. Verify the backend is accessible at the Render URL
2. Check network tab in browser dev tools
3. Ensure environment variables are set correctly in Netlify