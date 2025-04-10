const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
 
  const authHeader = req.header('Authorization');


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }
  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    req.user = user;
    next(); 
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
