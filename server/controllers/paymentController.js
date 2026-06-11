const Booking = require('../models/Booking');

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('vehicle', 'title');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes('placeholder')) {
      return res.json({
        success: true,
        clientSecret: null,
        amount: booking.totalPrice,
        currency: 'eur',
        bookingId: booking._id,
        testMode: true,
        message: 'Paguaj me para në dorë te pronari. Stripe nuk është konfiguruar ende.',
      });
    }

    const stripe = require('stripe')(stripeKey);
    const amountInCents = Math.round(booking.totalPrice * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: { bookingId: booking._id.toString() },
    });

    booking.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalPrice,
      currency: 'eur',
      bookingId: booking._id,
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (booking.stripePaymentIntentId && stripeKey && !stripeKey.includes('placeholder')) {
      const stripe = require('stripe')(stripeKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: 'Pagesa nuk është kryer ende' });
      }
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod || 'card';
    booking.status = 'confirmed';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
      paymentStatus: { $ne: 'pending' },
    })
      .populate('vehicle', 'title brand model images')
      .sort('-createdAt');
    res.json({ success: true, count: bookings.length, payments: bookings });
  } catch (error) {
    next(error);
  }
};
