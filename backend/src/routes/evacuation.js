const express = require('express');
const router = express.Router();
const evacuationController = require('../controllers/evacuationController');

router.post('/simulate', evacuationController.simulate);

module.exports = router;
