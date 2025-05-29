const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getListingReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  verifyReview
} = require('../controllers/reviewController');

// All review routes should be protected
router.use(protect);

// Get reviews for a listing
router.get('/listing/:listingId', getListingReviews);

// Get reviews by current user
router.get('/user', getUserReviews);

// Create a new review
router.post('/listing/:listingId', createReview);

// Update a review
router.put('/:reviewId', updateReview);

// Delete a review
router.delete('/:reviewId', deleteReview);

// Verify a review (admin only)
router.put('/:reviewId/verify', authorize('admin'), verifyReview);

module.exports = router;