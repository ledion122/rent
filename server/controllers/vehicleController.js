const Vehicle = require('../models/Vehicle');
const Business = require('../models/Business');
const { paginate } = require('../utils/helpers');

exports.getVehicles = async (req, res, next) => {
  try {
    const {
      brand, model, minPrice, maxPrice, transmission, fuelType,
      seats, category, location, search, sort, page, limit, owner,
    } = req.query;

    const filter = { status: 'approved', availability: true };

    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (model) filter.model = { $regex: model, $options: 'i' };
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (seats) filter.seats = parseInt(seats, 10);
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (owner) filter.owner = owner;

    if (minPrice || maxPrice) {
      filter.dailyPrice = {};
      if (minPrice) filter.dailyPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.dailyPrice.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.dailyPrice = 1;
    else if (sort === 'price_desc') sortOption.dailyPrice = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .populate('owner', 'firstName lastName profilePhoto')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Vehicle.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: vehicles.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyVehicles = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const distance = parseInt(maxDistance, 10) || 10000;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const degToKm = 111.32;
    const latDelta = distance / 1000 / degToKm;
    const lngDelta = distance / 1000 / (degToKm * Math.cos(latNum * (Math.PI / 180)));

    const vehicles = await Vehicle.find({
      status: 'approved',
      availability: true,
      'coordinates.lat': { $gte: latNum - latDelta, $lte: latNum + latDelta },
      'coordinates.lng': { $gte: lngNum - lngDelta, $lte: lngNum + lngDelta },
    }).populate('owner', 'firstName lastName profilePhoto');

    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};

exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'firstName lastName profilePhoto phone email')
      .populate('business', 'companyName logo phone email');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    req.body.status = 'approved';

    if (req.user.role === 'business') {
      const business = await Business.findOne({ owner: req.user.id });
      if (business) {
        req.body.business = business._id;
      }
    }

    const vehicle = await Vehicle.create(req.body);

    if (req.body.business) {
      await Business.findByIdAndUpdate(req.body.business, {
        $inc: { totalVehicles: 1 },
      });
    }

    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    if (vehicle.business) {
      await Business.findByIdAndUpdate(vehicle.business, {
        $inc: { totalVehicles: -1 },
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];
    vehicle.images = vehicle.images.concat(images);
    await vehicle.save();

    res.json({ success: true, images: vehicle.images });
  } catch (error) {
    next(error);
  }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    vehicle.availability = !vehicle.availability;
    await vehicle.save();

    res.json({ success: true, availability: vehicle.availability });
  } catch (error) {
    next(error);
  }
};
