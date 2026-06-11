const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Business = require('../models/Business');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, verified } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (verified) filter.verificationStatus = verified;

    const users = await User.find(filter)
      .select('-password -refreshToken -emailVerificationToken -resetPasswordToken -resetPasswordExpire')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'verified' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.getVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, ownerId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (ownerId) filter.owner = ownerId;

    const vehicles = await Vehicle.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(filter);

    res.json({
      success: true,
      count: vehicles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

exports.approveVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

exports.rejectVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

exports.getBusinesses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;

    const filter = {};
    if (verified) filter.verificationStatus = verified;

    const businesses = await Business.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Business.countDocuments(filter);

    res.json({
      success: true,
      count: businesses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      businesses,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyBusiness = async (req, res, next) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'verified' },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ success: true, business });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingVehicles = await Vehicle.countDocuments({ status: 'pending' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });

    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const mostRented = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$vehicle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    await Vehicle.populate(mostRented, {
      path: '_id',
      select: 'title brand model images dailyPrice',
    });

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const bookingTrends = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalBusinesses,
        totalVehicles,
        totalBookings,
        completedBookings,
        pendingVehicles,
        pendingVerifications,
        totalRevenue,
        mostRented,
        userGrowth,
        bookingTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};
