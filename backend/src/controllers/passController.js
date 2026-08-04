const crypto = require('crypto');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const { sendMail } = require('../utils/mailer');

const issuePass = async (req, res, next) => {
  try {
    const { appointmentId, expiresAt } = req.body;
    if (!appointmentId || !expiresAt) {
      return res.status(400).json({ message: 'appointmentId and expiresAt are required' });
    }

    const appointment = await Appointment.findById(appointmentId).populate('visitor');
    if (!appointment || appointment.status !== 'approved') {
      return res.status(400).json({ message: 'Appointment must be approved first' });
    }

    const existingPass = await Pass.findOne({ appointment: appointment._id });
    if (existingPass) {
      return res.status(400).json({ message: 'Pass already issued for this appointment' });
    }

    let visitor = appointment.visitor;
    if (!visitor) {
      visitor = await Visitor.create({
        name: appointment.visitorName,
        phone: appointment.visitorPhone,
        email: appointment.visitorEmail,
        purpose: appointment.purpose,
        status: 'approved',
      });
      appointment.visitor = visitor._id;
      await appointment.save();
    }

    const qrToken = crypto.randomBytes(16).toString('hex');
    const passNumber = `VP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const pass = await Pass.create({
      visitor: visitor._id,
      appointment: appointment._id,
      passNumber,
      qrToken,
      issuedBy: req.user._id,
      expiresAt,
    });

    const qrDataUrl = await QRCode.toDataURL(qrToken);

    await sendMail({
      to: appointment.visitorEmail,
      subject: 'Your visitor pass is ready',
      text: `Pass number: ${passNumber}`,
      html: `<p>Your visitor pass is ready.</p><p>Pass number: <strong>${passNumber}</strong></p>`,
    });

    res.status(201).json({ pass, qrDataUrl });
  } catch (error) {
    next(error);
  }
};

const listPasses = async (req, res, next) => {
  try {
    const passes = await Pass.find().populate('visitor').populate('appointment').sort({ createdAt: -1 });
    res.json({ passes });
  } catch (error) {
    next(error);
  }
};

const getPass = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id).populate('visitor').populate('appointment');
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    res.json({ pass });
  } catch (error) {
    next(error);
  }
};

const getMyPass = async (req, res, next) => {
  try {
    const visitor = await Visitor.findOne({ user: req.user._id });
    if (!visitor) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    const pass = await Pass.findOne({ visitor: visitor._id }).populate('visitor').populate('appointment');

    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    res.json({ pass });
  } catch (error) {
    next(error);
  }
};

const getQr = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id);
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    const qrDataUrl = await QRCode.toDataURL(pass.qrToken);
    res.json({ qrDataUrl });
  } catch (error) {
    next(error);
  }
};

const downloadPdf = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id).populate('visitor').populate('appointment');
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    const qrBuffer = await QRCode.toBuffer(pass.qrToken);
    const doc = new PDFDocument({ size: 'A6', margin: 20 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${pass.passNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Visitor Pass', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Pass No: ${pass.passNumber}`);
    doc.text(`Visitor: ${pass.visitor?.name || pass.appointment?.visitorName || ''}`);
    doc.text(`Purpose: ${pass.visitor?.purpose || pass.appointment?.purpose || ''}`);
    doc.text(`Valid Till: ${new Date(pass.expiresAt).toLocaleString()}`);
    doc.moveDown();
    doc.image(qrBuffer, { fit: [120, 120], align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

const scanPass = async (req, res, next) => {
  try {
    const { token, action } = req.body;
    if (!token || !action) {
      return res.status(400).json({ message: 'token and action are required' });
    }

    const pass = await Pass.findOne({ qrToken: token }).populate('visitor').populate('appointment');
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    if (pass.expiresAt && new Date(pass.expiresAt) < new Date()) {
      pass.status = 'expired';
      await pass.save();
      return res.status(400).json({ message: 'Pass has expired' });
    }

    const lastLog = await CheckLog.findOne({ pass: pass._id }).sort({ scannedAt: -1 });

    if (action === 'checkin' && lastLog && lastLog.action === 'checkin') {
      return res.status(400).json({ message: 'Visitor already checked in' });
    }

    if (action === 'checkout' && (!lastLog || lastLog.action !== 'checkin')) {
      return res.status(400).json({ message: 'Cannot check out before check in' });
    }

    const log = await CheckLog.create({
      pass: pass._id,
      visitor: pass.visitor._id,
      appointment: pass.appointment?._id || null,
      action,
      scannedBy: req.user._id,
      scanMethod: 'qr',
    });

    if (action === 'checkin') {
      pass.status = 'used';
      pass.visitor.status = 'checkedIn';
      pass.visitor.checkInAt = new Date();
      await pass.visitor.save();
    } else {
      pass.visitor.status = 'checkedOut';
      pass.visitor.checkOutAt = new Date();
      await pass.visitor.save();
    }

    await pass.save();
    res.json({ log, pass });
  } catch (error) {
    next(error);
  }
};

module.exports = { issuePass, listPasses, getPass, getMyPass, getQr, downloadPdf, scanPass };
