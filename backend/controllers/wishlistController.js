const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');

// Get user's 
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'listings',
        select: 'title price location images propertyType bedrooms bathrooms squareFeet',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    // If no wishlist exists, create an empty one
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        listings: []
      });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add listing to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { listingId } = req.body;

    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Find user's wishlist or create one
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        listings: [listingId]
      });
    } else {
      // Check if listing is already in wishlist
      if (wishlist.listings.includes(listingId)) {
        return res.status(400).json({
          success: false,
          message: 'Listing already in wishlist'
        });
      }
      
      // Add listing to wishlist
      wishlist.listings.push(listingId);
    }
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Listing added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove listing from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Remove listing from wishlist
    wishlist.listings = wishlist.listings.filter(
      id => id.toString() !== listingId
    );
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Listing removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.checkWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false
      });
    }
    
  
    const inWishlist = wishlist.listings.some(
      id => id.toString() === listingId
    );
    
    res.status(200).json({
      success: true,
      inWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.clearWishlist = async (req, res) => {
  try {
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
  
    wishlist.listings = [];
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: wishlist
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};