const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Security', 'Employee', 'Visitor'],
      default: 'Visitor',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
