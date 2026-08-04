require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Visitor = require('./src/models/Visitor');
const Appointment = require('./src/models/Appointment');
const Pass = require('./src/models/Pass');
const CheckLog = require('./src/models/CheckLog');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Visitor.deleteMany({}),
    Appointment.deleteMany({}),
    Pass.deleteMany({}),
    CheckLog.deleteMany({}),
  ]);

  const hash = async (value) => bcrypt.hash(value, 10);

  const users = await User.insertMany([
    {
      name: 'Admin One',
      email: 'admin@demo.com',
      password: await hash('Admin@123'),
      role: 'Admin',
      phone: '9000000001',
    },
    {
      name: 'Security One',
      email: 'security@demo.com',
      password: await hash('Security@123'),
      role: 'Security',
      phone: '9000000002',
    },
    {
      name: 'Security Two',
      email: 'security2@demo.com',
      password: await hash('Security@123'),
      role: 'Security',
      phone: '9000000003',
    },
    {
      name: 'Employee One',
      email: 'host@demo.com',
      password: await hash('Host@123'),
      role: 'Employee',
      phone: '9000000004',
    },
    {
      name: 'Employee Two',
      email: 'hr@demo.com',
      password: await hash('Employee@123'),
      role: 'Employee',
      phone: '9000000005',
    },
    {
      name: 'Visitor One',
      email: 'visitor1@demo.com',
      password: await hash('Visitor@123'),
      role: 'Visitor',
      phone: '9000000006',
    },
    {
      name: 'Visitor Two',
      email: 'visitor2@demo.com',
      password: await hash('Visitor@123'),
      role: 'Visitor',
      phone: '9000000007',
    },
  ]);

  const employee = users.find((user) => user.role === 'Employee');
  const visitorUsers = users.filter((user) => user.role === 'Visitor');

  const visitors = await Visitor.insertMany([
    {
      user: visitorUsers[0]._id,
      name: 'Rahul Mehta',
      phone: '9876543210',
      email: 'visitor1@demo.com',
      purpose: 'Project discussion',
      photoUrl: '',
      status: 'checkedOut',
      checkInAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      checkOutAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      user: visitorUsers[1]._id,
      name: 'Sara Khan',
      phone: '9988776655',
      email: 'visitor2@demo.com',
      purpose: 'Interview',
      photoUrl: '',
      status: 'approved',
    },
    {
      name: 'Aman Verma',
      phone: '9123456780',
      email: 'aman@example.com',
      purpose: 'Campus tour',
      photoUrl: '',
      status: 'pending',
    },
  ]);

  const appointments = await Appointment.insertMany([
    {
      host: employee._id,
      visitor: visitors[0]._id,
      visitorName: visitors[0].name,
      visitorPhone: visitors[0].phone,
      visitorEmail: visitors[0].email,
      purpose: visitors[0].purpose,
      visitDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'approved',
      approvedBy: users[0]._id,
      approvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      host: employee._id,
      visitor: visitors[1]._id,
      visitorName: visitors[1].name,
      visitorPhone: visitors[1].phone,
      visitorEmail: visitors[1].email,
      purpose: visitors[1].purpose,
      visitDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
    },
    {
      host: employee._id,
      visitorName: 'Aman Verma',
      visitorPhone: '9123456780',
      visitorEmail: 'aman@example.com',
      purpose: 'Campus tour',
      visitDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending',
    },
  ]);

  const passes = await Pass.insertMany([
    {
      visitor: visitors[0]._id,
      appointment: appointments[0]._id,
      passNumber: 'VP-1001-A1',
      qrToken: 'seed-token-1',
      status: 'used',
      issuedBy: users[1]._id,
      issuedAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      pdfPath: '',
    },
    {
      visitor: visitors[1]._id,
      appointment: appointments[1]._id,
      passNumber: 'VP-1002-B2',
      qrToken: 'seed-token-2',
      status: 'active',
      issuedBy: users[1]._id,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      pdfPath: '',
    },
  ]);

  await CheckLog.insertMany([
    {
      pass: passes[0]._id,
      visitor: visitors[0]._id,
      appointment: appointments[0]._id,
      action: 'checkin',
      scannedBy: users[1]._id,
      scanMethod: 'qr',
      scannedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      pass: passes[0]._id,
      visitor: visitors[0]._id,
      appointment: appointments[0]._id,
      action: 'checkout',
      scannedBy: users[1]._id,
      scanMethod: 'qr',
      scannedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seed completed');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
