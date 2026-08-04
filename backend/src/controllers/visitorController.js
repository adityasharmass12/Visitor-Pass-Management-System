const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const { sendMail } = require('../utils/mailer');

const registerVisitor = async (req, res, next) => {
  try {
    const { name, phone, email, purpose } = req.body;
    if (!name || !phone || !email || !purpose) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lowerEmail = email.toLowerCase();
    const photoUrl = req.file ? `/uploads/visitors/${req.file.filename}` : '';

    let user = await User.findOne({ email: lowerEmail });
    let tempPassword = '';

    if (!user) {
      tempPassword = crypto.randomBytes(4).toString('hex');
      const hash = await bcrypt.hash(tempPassword, 10);
      user = await User.create({
        name,
        email: lowerEmail,
        password: hash,
        role: 'Visitor',
        phone,
      });
    }

    const visitor = await Visitor.create({
      user: user._id,
      name,
      phone,
      email: lowerEmail,
      purpose,
      photoUrl,
      status: 'pending',
    });

    await sendMail({
      to: lowerEmail,
      subject: 'Visitor registration received',
      text: tempPassword
        ? `Your visitor account was created. Temporary password: ${tempPassword}`
        : 'Your visitor profile has been created.',
      html: tempPassword
        ? `<p>Your visitor account was created.</p><p>Temporary password: <strong>${tempPassword}</strong></p>`
        : '<p>Your visitor profile has been created.</p>',
    });

    res.status(201).json({ visitor, tempPassword });
  } catch (error) {
    next(error);
  }
};

const listVisitors = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const search = req.query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const visitors = await Visitor.find(filter).populate('user', 'name email role').sort({ createdAt: -1 });
    res.json({ visitors });
  } catch (error) {
    next(error);
  }
};

const getVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('user', 'name email role');
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({ visitor });
  } catch (error) {
    next(error);
  }
};

const getMyVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findOne({ user: req.user._id }).populate('user', 'name email role');
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor profile not found' });
    }

    res.json({ visitor });
  } catch (error) {
    next(error);
  }
};

const updateVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json({ visitor });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerVisitor, listVisitors, getVisitor, getMyVisitor, updateVisitor };
