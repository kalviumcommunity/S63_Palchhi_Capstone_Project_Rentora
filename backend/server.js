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
// Prepare socket origins in a variable to avoid any inline parsing issues
// Include both CLIENT_URL and FRONTEND_URL env vars (if set). Also include known Netlify fallbacks.
const socketOrigins = [
  process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173",
  "https://magical-otter-cbb01e.netlify.app",
  "https://stellar-cobbler-864deb.netlify.app",
  "https://rentora.netlify.app"
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: socketOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat: ${chatId}`);
  });

  // Handle new messages
  socket.on('send_message', (data) => {
    io.to(data.chatId).emit('receive_message', data);
  });

  // Handle typing status
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', data);
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    socket.to(data.chatId).emit('user_stop_typing', data);
  });

  // Handle chat updates
  socket.on('chat_updated', (data) => {
    io.to(data.chatId).emit('chat_updated', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// CORS configuration - simplified and robust
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://magical-otter-cbb01e.netlify.app',
  'https://stellar-cobbler-864deb.netlify.app',
  'https://rentora.netlify.app'
].filter(Boolean);



const corsOptions = {
  origin: function(origin, callback) {
    // Allow non-browser requests (like curl, Postman) which have no origin
    if (!origin) return callback(null, true);

    // Allow if origin exactly matches one of the allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: allowed origin', origin);
      return callback(null, true);
    }

    // Allow Netlify subdomains if needed (match *.netlify.app)
    if (/^https:\/\/([a-z0-9-]+)\.netlify\.app$/i.test(origin)) {
      console.log('CORS: allowed Netlify origin', origin);
      return callback(null, true);
    }

    console.warn('CORS: blocked origin', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'ETag', 'Last-Modified'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// Handle CORS preflight requests safely without relying on path matching
// Some router/path-to-regexp versions choke on '*' patterns; use method check instead.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Run CORS middleware for preflight requests using the same options
    return cors(corsOptions)(req, res, next);
  }
  return next();
});

// Security middleware
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
        "https://s63-palchhi-capstone-project-rentora.onrender.com",
        "https://magical-otter-cbb01e.netlify.app",
        "https://*.netlify.app",
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

// Body parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Simplified and more lenient approach
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for image requests and health checks
    return req.path.startsWith('/uploads/') || 
           req.path === '/health';
  },
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return req.ip;
  }
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', protect, wishlistRoutes);
app.use('/api', listingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/token-bookings', tokenBookingRoutes);

// Get absolute paths for upload directories
const projectRoot = __dirname;
const uploadsDir = path.join(projectRoot, 'public', 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const profileImagesDir = path.join(uploadsDir, 'profile-images');

// Create uploads directory if it doesn't exist
[uploadsDir, imagesDir, profileImagesDir].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
      // Verify directory is writable
      fs.accessSync(dir, fs.constants.W_OK);
      console.log(`Directory is writable: ${dir}`);
    }
  } catch (error) {
    console.error(`Error with directory ${dir}:`, error);
  }
});

// Serve static files with proper headers
app.use(['/uploads', '/api/uploads'], express.static(path.join(projectRoot, 'public', 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper content type based on file extension
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
    
    // Get file stats for content length and modification time
    try {
      const stats = fs.statSync(filePath);
      res.set('Content-Length', stats.size);
      
      // Use file's actual modification time for ETag and Last-Modified
      const mtime = stats.mtime.getTime();
      const etag = `"${mtime}-${stats.size}"`;
      
      // Set caching headers
      res.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year, immutable
      res.set('ETag', etag);
      res.set('Last-Modified', stats.mtime.toUTCString());
      
      // Set CORS headers
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Vary', 'Origin');
      
      // Add debug logging for image requests
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
  maxAge: '1y', // Cache for 1 year
  etag: true, // Enable ETag
  lastModified: true, // Enable Last-Modified
  fallthrough: true // Continue to next middleware if file not found
}));

// Add debug logging for static file serving
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/') || req.path.startsWith('/api/uploads/')) {
    // Remove /api prefix if present and any query parameters
    const cleanPath = req.path.replace(/^\/api/, '').split('?')[0];
    const fullPath = path.join(projectRoot, 'public', cleanPath);
    
    // Check if file exists
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const mtime = stats.mtime.getTime();
      const etag = `"${mtime}-${stats.size}"`;
      
      // Check if client's cached version is still valid
      const ifNoneMatch = req.headers['if-none-match'];
      const ifModifiedSince = req.headers['if-modified-since'];
      
      if (ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince).getTime() >= mtime)) {
        // Client's cached version is still valid
        res.status(304).end();
        return;
      }
    } else {
      // File not found, try alternative locations
      const filename = cleanPath.split('/').pop();
      const isProfileImage = cleanPath.includes('/profile-images/');
      
      // Define possible locations to check
      const possibleLocations = [
        path.join(projectRoot, 'public', 'uploads', 'profile-images', filename),
        path.join(projectRoot, 'public', 'uploads', 'images', filename),
        path.join(projectRoot, 'public', 'uploads', 'images', isProfileImage ? 'default-avatar.jpg' : 'default-property.jpg')
      ];
      
      // Try each location
      for (const location of possibleLocations) {
        if (fs.existsSync(location)) {
          console.log('Found image in alternative location:', location);
          return res.sendFile(location);
        }
      }
      
      // If no image found, serve default image
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
      
      // If even default image is not found, return 404
      console.log('No image found, returning 404');
      return res.status(404).send('Image not found');
    }
  }
  next();
});

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
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

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
