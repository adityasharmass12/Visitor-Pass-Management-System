const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema(
  {
    pass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pass',
      required: true,
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    action: {
      type: String,
      enum: ['checkin', 'checkout'],
      required: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scanMethod: {
      type: String,
      enum: ['qr', 'manual'],
      default: 'qr',
    },
    notes: {
      type: String,
      default: '',
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CheckLog', checkLogSchema);
