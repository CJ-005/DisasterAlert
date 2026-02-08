const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/me', verifyToken, gamificationController.getMe);

module.exports = router;
