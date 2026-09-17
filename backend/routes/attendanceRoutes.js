const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { checkIn, checkOut, getMyAttendance, listAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.use(requireAuth);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', getMyAttendance);
router.get('/', requireRole('admin'), listAttendance);

module.exports = router;
