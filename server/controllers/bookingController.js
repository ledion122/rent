const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { calculateBookingPrice } = require('../utils/helpers');
const { sendBookingConfirmation } = require('../services/emailService');

exports.createBooking = async (req, res, next) => {
  try {
    const { vehicle: vehicleId, startDate, endDate, pickupLocation, returnLocation, insurance, driverInfo } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!vehicle.availability) {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    const hasOverlap = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Vehicle is already booked for these dates' });
    }

    const totalPrice = calculateBookingPrice(
      vehicle.dailyPrice,
      startDate,
      endDate,
      vehicle.weeklyDiscount,
      vehicle.monthlyDiscount
    );

    if (insurance) {
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      totalPrice += days * 15;
    }

    const booking = await Booking.create({
      user: req.user.id,
      vehicle: vehicleId,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      returnLocation,
      insurance,
      driverInfo,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicle', 'title brand model images dailyPrice')
      .populate('user', 'firstName lastName email');

    const owner = await (require('../models/User')).findById(vehicle.owner);
    if (owner && owner.isEmailVerified) {
      await sendBookingConfirmation(req.user.email, {
        vehicleTitle: vehicle.title,
        startDate,
        endDate,
        totalPrice,
      }, req.user.firstName);
    }

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'admin') {
    } else if (req.query.asOwner) {
      const vehicles = await Vehicle.find({ owner: req.user.id }).select('_id');
      filter.vehicle = { $in: vehicles.map((v) => v._id) };
    } else {
      filter.user = req.user.id;
    }

    const bookings = await Booking.find(filter)
      .populate('vehicle', 'title brand model images dailyPrice location')
      .populate('user', 'firstName lastName email phone profilePhoto')
      .sort('-createdAt');

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'firstName lastName email phone profilePhoto');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not in pending status' });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Booking must be active to complete' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      vehicle: req.params.vehicleId,
      status: { $in: ['pending', 'confirmed', 'active'] },
    }).select('startDate endDate status');

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    if (!['cash', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Payment method must be cash or card' });
    }

    const booking = await Booking.findById(req.params.id).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot change payment method on completed or cancelled bookings' });
    }

    booking.paymentMethod = paymentMethod;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.markAsPaid = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Already marked as paid' });
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.startRental = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking must be confirmed before starting' });
    }

    booking.status = 'active';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
