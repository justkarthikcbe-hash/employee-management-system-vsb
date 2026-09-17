const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getMyPayroll, listPayroll, upsertPayroll } = require('../controllers/payrollController');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMyPayroll);
router.get('/', requireRole('admin'), listPayroll);
router.post('/', requireRole('admin'), upsertPayroll);

module.exports = router;
