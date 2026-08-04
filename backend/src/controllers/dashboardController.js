const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');

const overview = async (req, res, next) => {
  try {
    const [visitorCount, appointmentCount, pendingAppointments, activePasses, todaysCheckins] = await Promise.all([
      Visitor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Pass.countDocuments({ status: 'active' }),
      CheckLog.countDocuments({ action: 'checkin', scannedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    ]);

    res.json({ visitorCount, appointmentCount, pendingAppointments, activePasses, todaysCheckins });
  } catch (error) {
    next(error);
  }
};

const searchVisitors = async (req, res, next) => {
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
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const visitors = await Visitor.find(filter).sort({ createdAt: -1 });
    res.json({ visitors });
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.from || req.query.to) {
      filter.scannedAt = {};
      if (req.query.from) filter.scannedAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.scannedAt.$lte = new Date(req.query.to);
    }

    const logs = await CheckLog.find(filter)
      .populate('visitor', 'name email phone status')
      .populate('pass', 'passNumber status')
      .populate('scannedBy', 'name email role')
      .sort({ scannedAt: -1 });

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

const exportLogs = async (req, res, next) => {
  try {
    const logs = await CheckLog.find()
      .populate('visitor', 'name email phone status')
      .populate('pass', 'passNumber status')
      .populate('scannedBy', 'name email role')
      .sort({ scannedAt: -1 });

    const rows = [
      ['passNumber', 'visitor', 'action', 'scannedBy', 'scannedAt', 'status'],
      ...logs.map((log) => [
        log.pass?.passNumber || '',
        log.visitor?.name || '',
        log.action,
        log.scannedBy?.name || '',
        log.scannedAt.toISOString(),
        log.visitor?.status || '',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=visitor-logs.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { overview, searchVisitors, getLogs, exportLogs };
