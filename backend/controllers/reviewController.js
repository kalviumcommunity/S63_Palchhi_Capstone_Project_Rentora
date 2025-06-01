const Review = require('../models/Review');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// Helper function to create notification
const createNotification = async (recipient, sender, type, title, message, listingId = null) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      listing: listingId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get all reviews for a listing
exports.getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Get total count of reviews
    const totalReviews = await Review.countDocuments({ listing: listingId });
    
    // Get reviews for the listing with pagination
    const reviews = await Review.find({ listing: listingId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate average rating
    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRating = await Review.aggregate([
        { $match: { listing: listing._id } },
        { $group: { _id: null, total: { $sum: '$rating' } } }
      ]);
      averageRating = totalRating[0]?.total / totalReviews || 0;
    }
    
    res.status(200).json({
      success: true,
      data: {
        reviews,
        count: totalReviews,
        averageRating,
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a review for a listing
exports.createReview = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { rating, title, comment } = req.body;
    
    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check if user has already reviewed this listing
    const existingReview = await Review.findOne({
      listing: listingId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this listing'
      });
    }
    
    // Create new review
    const review = new Review({
      listing: listingId,
      user: req.user._id,
      rating,
      title,
      comment,
      // Auto-verify if user is the owner of the listing
      isVerified: listing.createdBy.toString() === req.user._id.toString()
    });
    
    await review.save();
    
    // Populate user data
    await review.populate('user', 'name profileImage');

    // Create notification for listing owner
    if (listing.createdBy.toString() !== req.user._id.toString()) {
      await createNotification(
        listing.createdBy,
        req.user._id,
        'review',
        'New Review',
        `${req.user.name} has reviewed your listing "${listing.title}"`,
        listingId
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    
    // Find review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Get listing for notification
    const listing = await Listing.findById(review.listing);
    
    // Update review
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    
    await review.save();
    
    // Populate user data
    await review.populate('user', 'name profileImage');

    // Create notification for listing owner
    if (listing && listing.createdBy.toString() !== req.user._id.toString()) {
      await createNotification(
        listing.createdBy,
        req.user._id,
        'review_update',
        'Review Updated',
        `${req.user.name} has updated their review for "${listing.title}"`,
        listing._id
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Find review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is the author of the review or an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Get listing for notification
    const listing = await Listing.findById(review.listing);
    
    await Review.findByIdAndDelete(reviewId);

    // Create notification for listing owner
    if (listing && listing.createdBy.toString() !== req.user._id.toString()) {
      await createNotification(
        listing.createdBy,
        req.user._id,
        'review_delete',
        'Review Deleted',
        `${req.user.name} has deleted their review for "${listing.title}"`,
        listing._id
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get reviews by current user
exports.getUserReviews = async (req, res) => {
  try {
    // First, verify the user exists
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find reviews with proper population
    const reviews = await Review.find({ user: req.user._id })
      .populate({
        path: 'listing',
        select: 'title images location createdBy',
        // Don't return null if listing is deleted
        options: { lean: true }
      })
      .populate({
        path: 'user',
        select: 'name profileImage',
        // Don't return null if user is deleted
        options: { lean: true }
      })
      .sort({ createdAt: -1 });

    // Log the reviews for debugging
    console.log('Found reviews:', reviews.map(review => ({
      id: review._id,
      hasListing: !!review.listing,
      listingTitle: review.listing?.title,
      hasUser: !!review.user,
      userName: review.user?.name
    })));

    // Filter out any reviews with missing data
    const validReviews = reviews.filter(review => 
      review && 
      review.listing && 
      review.user
    );

    res.status(200).json({
      success: true,
      data: validReviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Verify a review (admin only)
exports.verifyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify reviews'
      });
    }
    
    // Find and update review
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isVerified: true },
      { new: true }
    ).populate('user', 'name profileImage');
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Review verified successfully',
      data: review
    });
  } catch (error) {
    console.error('Error verifying review:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};