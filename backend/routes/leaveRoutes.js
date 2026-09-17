const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { applyLeave, getMyLeaves, listLeaves, decideLeave } = require('../controllers/leaveController');

const router = express.Router();

router.use(requireAuth);

router.post('/', applyLeave);
router.get('/me', getMyLeaves);
router.get('/', requireRole('admin'), listLeaves);
router.put('/:id/decision', requireRole('admin'), decideLeave);

module.exports = router;
