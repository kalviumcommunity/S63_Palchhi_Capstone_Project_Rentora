const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/Listing');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


const isTokenValid = (token) => {
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error.message);
    return false;
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const allowedRoles = ['buyer', 'seller', 'admin'];
    let userRole = 'buyer'; 
    if (role && allowedRoles.includes(role)) {
      userRole = role;
    }

    const newUser = new User({ 
      name, 
      email, 
      password, 
      role: userRole,
      authProvider: 'local'
    });

    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id);

    savedUser.token = token;
    savedUser.tokenCreatedAt = new Date();
    await savedUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      },
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let token = user.token;

    if (!token || !isTokenValid(token)) {
      token = generateToken(user._id);
      user.token = token;
      user.tokenCreatedAt = new Date();
      await user.save();
    }

    // Create a user object without sensitive data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phone: user.phone,
      authProvider: user.authProvider
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};




exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update user by ID (protected)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.params.id;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    // Handle file upload if present
    if (req.file) {
      try {
        // Ensure the upload directory exists
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profile-images');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate a unique filename
        const timestamp = Date.now();
        const randomNum = Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const filename = `profile-${timestamp}-${randomNum}${ext}`;
        
        // Move the file to the correct location
        const targetPath = path.join(uploadDir, filename);
        
        // Ensure the source file exists before moving
        if (!fs.existsSync(req.file.path)) {
          throw new Error('Source file not found');
        }
        
        // Move the file
        fs.renameSync(req.file.path, targetPath);
        
        // Set the profile image path with forward slashes
        const relativePath = path.relative(path.join(__dirname, '..', 'public'), targetPath)
          .replace(/\\/g, '/');
        updateData.profileImage = `/${relativePath}`;
        
        console.log('Profile image update:', {
          originalPath: req.file.path,
          targetPath: targetPath,
          profileImagePath: updateData.profileImage,
          relativePath: relativePath
        });
      } catch (error) {
        console.error('Error handling profile image upload:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile image',
          error: error.message
        });
      }
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user fields
    Object.assign(user, updateData);
    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(userId).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to delete their own account
    if (req.user._id.toString() === userId) {
      // Delete user's listings
      await Listing.deleteMany({ createdBy: userId });
      
      // Remove user from wishlists
      await Wishlist.updateMany(
        { listings: { $in: await Listing.find({ createdBy: userId }).select('_id') } },
        { $pull: { listings: { $in: await Listing.find({ createdBy: userId }).select('_id') } } }
      );
      
      // Delete user's reviews
      await Review.deleteMany({ user: userId });
      
      // Delete user's notifications
      await Notification.deleteMany({ recipient: userId });
      
      // Delete user's chats
      await Chat.deleteMany({ participants: userId });
      
      // Delete user's messages
      await Message.deleteMany({ sender: userId });
      
      // Finally, delete the user
      await User.findByIdAndDelete(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    }

    // If admin is deleting another user's account
    if (req.user.role === 'admin') {
      // Delete user's listings
      await Listing.deleteMany({ createdBy: userId });
      
      // Remove user from wishlists
      await Wishlist.updateMany(
        { listings: { $in: await Listing.find({ createdBy: userId }).select('_id') } },
        { $pull: { listings: { $in: await Listing.find({ createdBy: userId }).select('_id') } } }
      );
      
      // Delete user's reviews
      await Review.deleteMany({ user: userId });
      
      // Delete user's notifications
      await Notification.deleteMany({ recipient: userId });
      
      // Delete user's chats
      await Chat.deleteMany({ participants: userId });
      
      // Delete user's messages
      await Message.deleteMany({ sender: userId });
      
      // Finally, delete the user
      await User.findByIdAndDelete(userId);
      
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this user'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = req.body;

    // Verify user is updating their own preferences or is an admin
    if (id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update these preferences'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user preferences
    user.preferences = {
      ...user.preferences,
      ...preferences
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
