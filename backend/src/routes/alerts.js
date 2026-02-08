const express = require('express');
const router = express.Router();
const disasterAlertController = require('../controllers/disasterAlertController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

router.get('/', disasterAlertController.list);
router.get('/:id', disasterAlertController.getById);

router.post('/', verifyToken, requireRole('ADMIN'), disasterAlertController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), disasterAlertController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), disasterAlertController.remove);

module.exports = router;
