const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    token: {
      type: String,
    },
    tokenCreatedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);


userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) return next();
  
  // Skip password hashing for Google auth users
  if (this.authProvider === 'google') return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {

  if (this.authProvider === 'google') {
    return false; 
  }
  
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
