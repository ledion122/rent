const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
  getVehicleBookings,
  updatePaymentMethod,
  markAsPaid,
  startRental,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/vehicle/:vehicleId', protect, getVehicleBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/confirm', protect, confirmBooking);
router.put('/:id/complete', protect, completeBooking);
router.put('/:id/payment-method', protect, updatePaymentMethod);
router.put('/:id/mark-paid', protect, markAsPaid);
router.put('/:id/start-rental', protect, startRental);

module.exports = router;
