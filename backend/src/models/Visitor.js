const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
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
    photoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'checkedIn', 'checkedOut'],
      default: 'pending',
    },
    checkInAt: Date,
    checkOutAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visitor', visitorSchema);
