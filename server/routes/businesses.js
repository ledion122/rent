const express = require('express');
const router = express.Router();
const {
  registerBusiness,
  getBusinesses,
  getBusiness,
  updateBusiness,
  addEmployee,
  removeEmployee,
  getAnalytics,
} = require('../controllers/businessController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, registerBusiness);
router.get('/', getBusinesses);
router.get('/analytics', protect, getAnalytics);
router.get('/:id', getBusiness);
router.put('/:id', protect, updateBusiness);
router.post('/:id/employees', protect, addEmployee);
router.delete('/:id/employees/:employeeId', protect, removeEmployee);

module.exports = router;
