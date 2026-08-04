const express = require('express');
const { createAppointment, listAppointments, approveAppointment, rejectAppointment } = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, restrictTo('Admin', 'Security', 'Employee'), createAppointment);
router.get('/', protect, restrictTo('Admin', 'Security', 'Employee'), listAppointments);
router.patch('/:id/approve', protect, restrictTo('Admin', 'Employee'), approveAppointment);
router.patch('/:id/reject', protect, restrictTo('Admin', 'Employee'), rejectAppointment);

module.exports = router;
