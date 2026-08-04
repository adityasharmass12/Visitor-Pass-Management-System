const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      default: null,
    },
    visitorName: {
      type: String,
      required: true,
      trim: true,
    },
    visitorPhone: {
      type: String,
      required: true,
      trim: true,
    },
    visitorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    visitDateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: Date,
    rejectionReason: {
      type: String,
      default: '',
    },
    notificationSentAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
