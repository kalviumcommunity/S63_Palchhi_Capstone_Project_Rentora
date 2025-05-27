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


router.get('/listing/:listingId', getListingReviews);


router.use(protect);

router.get('/user', getUserReviews);

router.post('/listing/:listingId', createReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);


router.put('/:reviewId/verify', authorize('admin'), verifyReview);

module.exports = router;