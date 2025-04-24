const express = require('express');
const { levelUp } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/level-up', protect, levelUp);

module.exports = router;
