const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
