const express = require('express');
const { createUser, listUsers, updateUser } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('Admin'));
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);

module.exports = router;
