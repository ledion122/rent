const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.createReview = async (req, res, next) => {
  try {
    const { vehicle, booking, rating, comment } = req.body;

    const existingBooking = await Booking.findById(booking);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (existingBooking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (existingBooking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ user: req.user.id, vehicle });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this vehicle' });
    }

    const review = await Review.create({
      user: req.user.id,
      vehicle,
      booking,
      rating,
      comment,
    });

    const reviews = await Review.find({ vehicle });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Vehicle.findByIdAndUpdate(vehicle, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'firstName lastName profilePhoto');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleReviews = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await Review.find({ vehicle: vehicleId })
      .populate('user', 'firstName lastName profilePhoto')
      .sort('-createdAt');

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('vehicle', 'title brand model images')
      .sort('-createdAt');

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vehicleId = review.vehicle;
    await Review.findByIdAndDelete(req.params.id);

    const reviews = await Review.find({ vehicle: vehicleId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await Vehicle.findByIdAndUpdate(vehicleId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length,
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
