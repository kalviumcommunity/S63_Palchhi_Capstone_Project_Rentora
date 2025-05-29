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
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "http://localhost:8000", "http://localhost:5173", "ws:", "wss:"],
      mediaSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', listingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api', chatRoutes);

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
app.use('/uploads', express.static(path.join(projectRoot, 'public', 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  },
  fallthrough: false // Don't continue to next middleware if file not found
}));

// Error handler for static file serving
app.use((err, req, res, next) => {
  if (err.status === 404 && req.path.startsWith('/uploads/')) {
    // For profile images, return a default avatar
    if (req.path.includes('/profile-images/')) {
      return res.redirect('/uploads/images/default-avatar.jpg');
    }
    // For other uploads, return a 404
    return res.status(404).json({
      success: false,
      message: 'File not found',
      path: req.path
    });
  }
  next(err);
});

// Add debug logging for static file serving
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/')) {
    const fullPath = path.join(projectRoot, 'public', req.path);
    const exists = fs.existsSync(fullPath);
    const dirPath = path.dirname(fullPath);
    const dirExists = fs.existsSync(dirPath);
    
    if (!exists) {
      console.log('File not found:', {
        path: req.path,
        fullPath: fullPath,
        dirExists: dirExists,
        dirPath: dirPath
      });
      
      // For profile images, redirect to default avatar
      if (req.path.includes('/profile-images/')) {
        return res.redirect('/uploads/images/default-avatar.jpg');
      }
    }
  }
  next();
});

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
