# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend (Render)
- [ ] MongoDB Atlas database created
- [ ] Backend environment variables ready
- [ ] GitHub repository pushed with latest code
- [ ] Render account created

### Frontend (Netlify)
- [ ] Frontend environment variables ready
- [ ] Netlify account created
- [ ] `netlify.toml` file in root directory

---

## 🔧 Backend Deployment Steps

1. **Go to [render.com](https://render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub repository**
4. **Configure:**
   - Name: `rentora-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables:**
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (update after frontend deployment)
   - `CLIENT_URL`: (update after frontend deployment)
6. **Deploy and note the URL**

---

## 🎨 Frontend Deployment Steps

1. **Go to [netlify.com](https://netlify.com)**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect GitHub repository**
4. **Configure:**
   - Base directory: `frontend/client`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Add Environment Variables:**
   - `VITE_API_URL`: Your Render backend URL
6. **Deploy and note the URL**

---

## 🔗 Connect Frontend & Backend

1. **Update backend environment variables in Render:**
   - `FRONTEND_URL`: Your Netlify URL
   - `CLIENT_URL`: Your Netlify URL
2. **Redeploy backend** (Render will auto-redeploy)
3. **Test the connection**

---

## 🧪 Testing Checklist

- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Property listings load
- [ ] File uploads work
- [ ] Chat functionality works
- [ ] All features tested

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Full Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 