const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const { sendMail } = require('../utils/mailer');

const createAppointment = async (req, res, next) => {
  try {
    const { visitorName, visitorPhone, visitorEmail, purpose, visitDateTime, visitorId } = req.body;

    if (!visitorName || !visitorPhone || !visitorEmail || !purpose || !visitDateTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lowerEmail = visitorEmail.toLowerCase();
    let visitor = null;

    if (visitorId) {
      visitor = await Visitor.findById(visitorId);
    } else {
      visitor = await Visitor.findOne({ email: lowerEmail });
    }

    if (!visitor) {
      let user = await User.findOne({ email: lowerEmail });
      if (!user) {
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 10);
        user = await User.create({
          name: visitorName,
          email: lowerEmail,
          password: hash,
          role: 'Visitor',
          phone: visitorPhone,
        });
      }

      visitor = await Visitor.create({
        user: user._id,
        name: visitorName,
        phone: visitorPhone,
        email: lowerEmail,
        purpose,
        status: 'pending',
      });
    }

    const appointment = await Appointment.create({
      host: req.user._id,
      visitor: visitor._id,
      visitorName,
      visitorPhone,
      visitorEmail: lowerEmail,
      purpose,
      visitDateTime,
      status: 'pending',
    });

    await sendMail({
      to: lowerEmail,
      subject: 'Visit request created',
      text: `A visit request has been created for ${new Date(visitDateTime).toLocaleString()}.`,
      html: `<p>Your visit request has been created for <strong>${new Date(visitDateTime).toLocaleString()}</strong>.</p>`,
    });

    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
};

const listAppointments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.mine === '1' && req.user.role === 'Employee') {
      filter.host = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('host', 'name email role')
      .populate('visitor', 'name email phone status')
      .sort({ createdAt: -1 });

    res.json({ appointments });
  } catch (error) {
    next(error);
  }
};

const approveAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'approved';
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    appointment.rejectionReason = '';
    await appointment.save();

    if (appointment.visitor) {
      await Visitor.findByIdAndUpdate(appointment.visitor, { status: 'approved' });
    }

    await sendMail({
      to: appointment.visitorEmail,
      subject: 'Visit approved',
      text: 'Your visit request has been approved.',
      html: '<p>Your visit request has been approved.</p>',
    });

    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

const rejectAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'rejected';
    appointment.rejectionReason = reason || 'Rejected by host';
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    await appointment.save();

    await sendMail({
      to: appointment.visitorEmail,
      subject: 'Visit rejected',
      text: appointment.rejectionReason,
      html: `<p>${appointment.rejectionReason}</p>`,
    });

    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, listAppointments, approveAppointment, rejectAppointment };
