const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, profilePhoto } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, profilePhoto },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.uploadDriverLicense = async (req, res, next) => {
  try {
    const { frontImage, backImage } = req.body;

    const user = await User.findById(req.user.id);
    if (frontImage) user.driverLicense.frontImage = frontImage;
    if (backImage) user.driverLicense.backImage = backImage;
    await user.save();

    res.json({ success: true, driverLicense: user.driverLicense });
  } catch (error) {
    next(error);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).sort('-createdAt');
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('vehicle', 'title brand model images dailyPrice')
      .sort('-createdAt');
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};
