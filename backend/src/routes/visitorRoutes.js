const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { registerVisitor, listVisitors, getVisitor, getMyVisitor, updateVisitor } = require('../controllers/visitorController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'visitors');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({ storage });

router.post('/register', upload.single('photo'), registerVisitor);
router.get('/me', protect, restrictTo('Visitor'), getMyVisitor);
router.get('/', protect, restrictTo('Admin', 'Security', 'Employee'), listVisitors);
router.get('/:id', protect, restrictTo('Admin', 'Security', 'Employee', 'Visitor'), getVisitor);
router.patch('/:id', protect, restrictTo('Admin', 'Security', 'Employee'), updateVisitor);

module.exports = router;
