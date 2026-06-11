const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadDriverLicense,
  getListings,
  getBookings,
  deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/driver-license', protect, uploadDriverLicense);
router.get('/listings', protect, getListings);
router.get('/bookings', protect, getBookings);
router.delete('/account', protect, deleteAccount);

module.exports = router;
