const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    pickupLocation: {
      type: String,
    },
    returnLocation: {
      type: String,
    },
    insurance: {
      type: Boolean,
      default: false,
    },
    driverInfo: {
      firstName: String,
      lastName: String,
      phone: String,
      email: String,
      licenseNumber: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
