const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided, authorization denied' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload, authorization denied' 
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found, authorization denied' 
      });
    }

    if (user.token && user.token !== token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token has been invalidated, please log in again' 
      });
    }

    req.user = user; 
    console.log('✅ Authenticated user:', user.email);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({ 
      success: false,
      message: 'Token is not valid or has expired' 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
