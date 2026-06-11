const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: [true, 'Transmission is required'],
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      required: [true, 'Fuel type is required'],
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
    },
    doors: {
      type: Number,
      required: [true, 'Number of doors is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    description: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    dailyPrice: {
      type: Number,
      required: [true, 'Daily price is required'],
    },
    weeklyDiscount: {
      type: Number,
      default: 0,
    },
    monthlyDiscount: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    category: {
      type: String,
      enum: ['economy', 'compact', 'mid-size', 'suv', 'luxury', 'van', 'truck'],
      required: [true, 'Category is required'],
    },
    features: [
      {
        type: String,
      },
    ],
    insurance: {
      type: { type: String },
      provider: { type: String },
      expiryDate: { type: Date },
    },
    mileage: {
      type: Number,
    },
    fuelPolicy: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
