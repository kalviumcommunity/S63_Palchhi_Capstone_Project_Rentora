const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} = require('../controllers/wishlistController');

// All routes are protected and require authentication
router.use(protect);


router.get('/', getWishlist);


router.post('/add', addToWishlist);


router.delete('/remove/:listingId', removeFromWishlist);


router.get('/check/:listingId', checkWishlist);


router.delete('/clear', clearWishlist);

module.exports = router;