const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getMyProfile,
  updateMyProfile,
  listEmployees,
  getEmployeeById,
  updateEmployeeById,
  setEmployeeActiveStatus,
} = require('../controllers/employeeController');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

router.get('/', requireRole('admin'), listEmployees);
router.get('/:id', requireRole('admin'), getEmployeeById);
router.put('/:id', requireRole('admin'), updateEmployeeById);
router.put('/:id/status', requireRole('admin'), setEmployeeActiveStatus);

module.exports = router;
