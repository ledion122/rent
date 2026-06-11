const Business = require('../models/Business');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

exports.registerBusiness = async (req, res, next) => {
  try {
    const existing = await Business.findOne({ owner: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a business profile' });
    }

    const { companyName, registrationNumber, description, address, city, phone, email, website } = req.body;

    const business = await Business.create({
      companyName,
      registrationNumber,
      description,
      address,
      city,
      phone,
      email,
      website,
      owner: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, { role: 'business' });

    res.status(201).json({ success: true, business });
  } catch (error) {
    next(error);
  }
};

exports.getBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find({ isActive: true })
      .populate('owner', 'firstName lastName email phone')
      .sort('-createdAt');

    res.json({ success: true, count: businesses.length, businesses });
  } catch (error) {
    next(error);
  }
};

exports.getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone profilePhoto')
      .populate('employees.user', 'firstName lastName email');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const vehicles = await Vehicle.find({ business: business._id, status: 'approved' });

    res.json({ success: true, business, vehicles });
  } catch (error) {
    next(error);
  }
};

exports.updateBusiness = async (req, res, next) => {
  try {
    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, business });
  } catch (error) {
    next(error);
  }
};

exports.addEmployee = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { user: userId, role } = req.body;

    const alreadyEmployee = business.employees.find(
      (e) => e.user.toString() === userId
    );
    if (alreadyEmployee) {
      return res.status(400).json({ message: 'User is already an employee' });
    }

    business.employees.push({ user: userId, role });
    await business.save();

    res.json({ success: true, business });
  } catch (error) {
    next(error);
  }
};

exports.removeEmployee = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    business.employees = business.employees.filter(
      (e) => e.user.toString() !== req.params.employeeId
    );
    await business.save();

    res.json({ success: true, business });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const vehicles = await Vehicle.find({ business: business._id });
    const vehicleIds = vehicles.map((v) => v._id);

    const totalBookings = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      status: { $ne: 'cancelled' },
    });

    const completedBookings = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      status: 'completed',
    });

    const revenueResult = await Booking.aggregate([
      { $match: { vehicle: { $in: vehicleIds }, status: { $in: ['completed', 'confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const monthlyBookings = await Booking.aggregate([
      { $match: { vehicle: { $in: vehicleIds } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalVehicles: vehicles.length,
        totalBookings,
        completedBookings,
        totalRevenue,
        monthlyBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
