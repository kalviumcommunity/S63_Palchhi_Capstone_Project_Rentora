# 🚀 Deployment Guide - Rentora

This guide will help you deploy your Rentora application to Netlify (Frontend) and Render (Backend).

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **MongoDB Atlas**: Set up a MongoDB database
3. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
4. **Render Account**: Sign up at [render.com](https://render.com)

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend Environment

1. **Create `.env` file** in the `backend` directory:
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Update `.env` with your values**:
   ```env
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/rentora?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   PORT=8000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-app-name.netlify.app
   CLIENT_URL=https://your-frontend-app-name.netlify.app
   ```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)** and sign in
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `rentora-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

5. **Add Environment Variables** in Render dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Netlify frontend URL (update after frontend deployment)
   - `CLIENT_URL`: Your Netlify frontend URL (update after frontend deployment)

6. **Click "Create Web Service"**

7. **Wait for deployment** and note your backend URL (e.g., `https://rentora-backend.onrender.com`)

---

## 🎨 Frontend Deployment (Netlify)

### Step 1: Prepare Frontend Environment

1. **Create `.env` file** in the `frontend/client` directory:
   ```bash
   cd frontend/client
   cp env.example .env
   ```

2. **Update `.env` with your backend URL**:
   ```env
   VITE_API_URL=https://your-backend-app-name.onrender.com
   NODE_ENV=production
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI

1. **Go to [netlify.com](https://netlify.com)** and sign in
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect your GitHub repository**
4. **Configure the build settings**:
   - **Base directory**: `frontend/client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

5. **Add Environment Variables** in Netlify dashboard:
   - `VITE_API_URL`: Your Render backend URL
   - `NODE_ENV`: `production`

6. **Click "Deploy site"**

#### Option B: Deploy via Git Push

1. **Push your code to GitHub** (if not already done)
2. **Netlify will automatically detect the `netlify.toml`** configuration
3. **Set environment variables** in Netlify dashboard as above

---

## 🔗 Connect Frontend and Backend

### Step 1: Update Backend CORS

After your frontend is deployed, update the backend environment variables in Render:

1. **Go to your Render dashboard**
2. **Navigate to your backend service**
3. **Go to "Environment" tab**
4. **Update these variables**:
   - `FRONTEND_URL`: `https://your-frontend-app-name.netlify.app`
   - `CLIENT_URL`: `https://your-frontend-app-name.netlify.app`

5. **Redeploy the backend** (Render will auto-redeploy)

### Step 2: Test the Connection

1. **Visit your Netlify frontend URL**
2. **Try to register/login** to test the API connection
3. **Check browser console** for any CORS errors

---

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` and `CLIENT_URL` are correctly set in backend
   - Check that the URLs match exactly (including https://)

2. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

3. **API Connection Issues**:
   - Verify the `VITE_API_URL` in frontend environment
   - Check if backend is running on Render

4. **Environment Variables**:
   - Ensure all required variables are set in both platforms
   - Check for typos in variable names

### Debug Steps:

1. **Check Render logs** for backend errors
2. **Check Netlify build logs** for frontend errors
3. **Use browser developer tools** to check network requests
4. **Verify MongoDB connection** in backend logs

---

## 📝 Environment Variables Summary

### Backend (Render):
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
CLIENT_URL=https://your-app.netlify.app
```

### Frontend (Netlify):
```env
VITE_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

---

## ✅ Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database connection working
- [ ] User registration/login working
- [ ] File uploads working
- [ ] All features tested

---

## 🆘 Support

If you encounter issues:

1. **Check the logs** in both Render and Netlify dashboards
2. **Verify environment variables** are correctly set
3. **Test locally** first to ensure code works
4. **Check MongoDB Atlas** connection and permissions

Your Rentora application should now be live and accessible! 🎉 