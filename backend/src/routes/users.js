const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.put('/password', userController.updatePassword);
router.put('/deactivate', userController.deactivate);

module.exports = router;
