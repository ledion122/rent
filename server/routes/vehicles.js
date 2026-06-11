const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getNearbyVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadImages,
  toggleAvailability,
} = require('../controllers/vehicleController');
const { protect } = require('../middlewares/auth');

router.get('/', getVehicles);
router.get('/nearby', getNearbyVehicles);
router.get('/:id', getVehicle);
router.post('/', protect, createVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);
router.post('/:id/images', protect, uploadImages);
router.put('/:id/availability', protect, toggleAvailability);

module.exports = router;
