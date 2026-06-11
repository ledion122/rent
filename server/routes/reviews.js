const express = require('express');
const router = express.Router();
const {
  createReview,
  getVehicleReviews,
  getUserReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createReview);
router.get('/vehicle/:vehicleId', getVehicleReviews);
router.get('/user/:userId', getUserReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
