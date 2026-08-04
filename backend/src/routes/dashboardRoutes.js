const express = require('express');
const { overview, searchVisitors, getLogs, exportLogs } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('Admin', 'Security'));
router.get('/overview', overview);
router.get('/visitors', searchVisitors);
router.get('/logs', getLogs);
router.get('/logs/export', exportLogs);

module.exports = router;
