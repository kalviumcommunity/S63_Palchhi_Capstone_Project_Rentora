require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const tokenBookingRoutes = require('./routes/tokenBookingRoutes');
const { protect } = require('./middleware/authMiddleware');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);


const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'https://magical-otter-cbb01e.netlify.app',
      'https://s63-palchhi-capstone-project-rentora.onrender.com'
    ].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept'
    ]
  }
});


io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

 
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat: ${chatId}`);
  });


  socket.on('send_message', (data) => {
    io.to(data.chatId).emit('receive_message', data);
  });

  
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', data);
  });


  socket.on('stop_typing', (data) => {
    socket.to(data.chatId).emit('user_stop_typing', data);
  });


  socket.on('chat_updated', (data) => {
    io.to(data.chatId).emit('chat_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors({
  origin: function(origin, callback) {
   
    if (!origin) return callback(null, true);
    
   
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
     
      console.warn(`Origin ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Cache-Control',
    'Pragma',
    'If-Modified-Since',
    'If-None-Match'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'ETag', 'Last-Modified'],
  maxAge: 86400 
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: [
        "'self'", 
        "http://localhost:8000", 
        "http://localhost:3000", 
        "https://magical-otter-cbb01e.netlify.app",
        "https://s63-palchhi-capstone-project-rentora.onrender.com",
        "ws:", 
        "wss:"
      ],
      mediaSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));


app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.options('*', (req, res) => {
 
  console.log('OPTIONS request received:', {
    origin: req.headers.origin,
    path: req.path,
    method: req.method
  });
  
  const origin = req.headers.origin;
  

  if (origin && allowedOrigins.indexOf(origin) !== -1) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
  
    if (origin) {
      console.warn(`Origin ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
    }
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma, If-Modified-Since, If-None-Match');
  res.header('Access-Control-Max-Age', '86400'); 
  res.status(200).end();
});


app.use((req, res, next) => {
  
  if (req.method !== 'OPTIONS') {
    console.log('Request received:', {
      origin: req.headers.origin,
      path: req.path,
      method: req.method
    });
  }
  
  const origin = req.headers.origin;
  

  if (origin && allowedOrigins.indexOf(origin) !== -1) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
  
    if (origin) {
      console.warn(`Origin ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
    }
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma, If-Modified-Since, If-None-Match');
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
   
    return req.user !== undefined || req.path.startsWith('/uploads/');
  },
  keyGenerator: (req) => {
   
    return req.user ? req.user._id : req.ip;
  }
});


app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/uploads/')) {
    next();
  } else {
    limiter(req, res, next);
  }
});


connectDB();


app.use('/api/auth', authRoutes);
app.use('/api/wishlist', protect, wishlistRoutes);
app.use('/api', listingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/token-bookings', tokenBookingRoutes);


const projectRoot = __dirname;
const uploadsDir = path.join(projectRoot, 'public', 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const profileImagesDir = path.join(uploadsDir, 'profile-images');


[uploadsDir, imagesDir, profileImagesDir].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
     
      fs.accessSync(dir, fs.constants.W_OK);
      console.log(`Directory is writable: ${dir}`);
    }
  } catch (error) {
    console.error(`Error with directory ${dir}:`, error);
  }
});


app.use('/uploads', express.static(path.join(projectRoot, 'public', 'uploads'), {
  setHeaders: (res, filePath) => {
    
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.set('Content-Type', contentType);
    
  
    try {
      const stats = fs.statSync(filePath);
      res.set('Content-Length', stats.size);
      

      const mtime = stats.mtime.getTime();
      const etag = `"${mtime}-${stats.size}"`;
      
      
      res.set('Cache-Control', 'public, max-age=31536000, immutable'); 
      res.set('ETag', etag);
      res.set('Last-Modified', stats.mtime.toUTCString());
      
      
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Vary', 'Origin');
      
      
      console.log('Serving static file:', {
        path: filePath,
        contentType: res.get('Content-Type'),
        contentLength: res.get('Content-Length'),
        extension: ext,
        cacheControl: res.get('Cache-Control'),
        etag: res.get('ETag'),
        lastModified: res.get('Last-Modified')
      });
    } catch (error) {
      console.error('Error getting file stats:', error);
    }
  },
  maxAge: '1y', 
  etag: true, 
  lastModified: true, 
  fallthrough: true 
}));


app.use('/api/uploads', express.static(path.join(projectRoot, 'public', 'uploads'), {
  setHeaders: (res, filePath) => {

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.set('Content-Type', contentType);
    
    
    try {
      const stats = fs.statSync(filePath);
      res.set('Content-Length', stats.size);
      
      
      const mtime = stats.mtime.getTime();
      const etag = `"${mtime}-${stats.size}"`;
      
      
      
      res.set('Cache-Control', 'public, max-age=31536000, immutable'); 
      res.set('ETag', etag);
      res.set('Last-Modified', stats.mtime.toUTCString());
      
  
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Vary', 'Origin');
      
     
      console.log('Serving static file:', {
        path: filePath,
        contentType: res.get('Content-Type'),
        contentLength: res.get('Content-Length'),
        extension: ext,
        cacheControl: res.get('Cache-Control'),
        etag: res.get('ETag'),
        lastModified: res.get('Last-Modified')
      });
    } catch (error) {
      console.error('Error getting file stats:', error);
    }
  },
  maxAge: '1y', 
  etag: true, 
  lastModified: true, 
  fallthrough: true 
}));


app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/') || req.path.startsWith('/api/uploads/')) {
    
    const cleanPath = req.path.replace(/^\/api/, '').split('?')[0];
    const fullPath = path.join(projectRoot, 'public', cleanPath);
    
  
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const mtime = stats.mtime.getTime();
      const etag = `"${mtime}-${stats.size}"`;
      
      const ifNoneMatch = req.headers['if-none-match'];
      const ifModifiedSince = req.headers['if-modified-since'];
      
      if (ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince).getTime() >= mtime)) {
      
        res.status(304).end();
        return;
      }
    } else {

      const filename = cleanPath.split('/').pop();
      const isProfileImage = cleanPath.includes('/profile-images/');
      
  
      const possibleLocations = [
        path.join(projectRoot, 'public', 'uploads', 'profile-images', filename),
        path.join(projectRoot, 'public', 'uploads', 'images', filename),
        path.join(projectRoot, 'public', 'uploads', 'images', isProfileImage ? 'default-avatar.jpg' : 'default-property.jpg')
      ];
      
     
      for (const location of possibleLocations) {
        if (fs.existsSync(location)) {
          console.log('Found image in alternative location:', location);
          return res.sendFile(location);
        }
      }
      
      const defaultImage = path.join(
        projectRoot,
        'public',
        'uploads',
        'images',
        isProfileImage ? 'default-avatar.jpg' : 'default-property.jpg'
      );
      
      if (fs.existsSync(defaultImage)) {
        console.log('Serving default image:', defaultImage);
        return res.sendFile(defaultImage);
      }
      

      console.log('No image found, returning 404');
      return res.status(404).send('Image not found');
    }
  }
  next();
});


app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/test', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Rentora API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});


app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {

  console.log('CORS test request headers:', req.headers);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    success: true,
    message: 'CORS is working!',
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
