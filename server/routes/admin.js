const express = require('express');
const router = express.Router();
const {
  getUsers,
  verifyUser,
  rejectUser,
  getVehicles,
  approveVehicle,
  rejectVehicle,
  getBusinesses,
  verifyBusiness,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/reject', rejectUser);
router.get('/vehicles', getVehicles);
router.put('/vehicles/:id/approve', approveVehicle);
router.put('/vehicles/:id/reject', rejectVehicle);
router.get('/businesses', getBusinesses);
router.put('/businesses/:id/verify', verifyBusiness);
router.get('/analytics', getAnalytics);

module.exports = router;
