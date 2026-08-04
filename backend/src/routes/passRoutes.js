const express = require('express');
const { issuePass, listPasses, getPass, getMyPass, getQr, downloadPdf, scanPass } = require('../controllers/passController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, restrictTo('Admin', 'Security'), issuePass);
router.post('/scan', protect, restrictTo('Admin', 'Security'), scanPass);
router.get('/me', protect, restrictTo('Visitor'), getMyPass);
router.get('/', protect, restrictTo('Admin', 'Security', 'Employee'), listPasses);
router.get('/:id', protect, restrictTo('Admin', 'Security', 'Employee', 'Visitor'), getPass);
router.get('/:id/qr', protect, restrictTo('Admin', 'Security', 'Employee', 'Visitor'), getQr);
router.get('/:id/pdf', protect, restrictTo('Admin', 'Security', 'Employee', 'Visitor'), downloadPdf);

module.exports = router;
