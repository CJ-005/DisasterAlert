const express = require('express');
const router = express.Router();
const evacuationCenterController = require('../controllers/evacuationCenterController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

router.get('/', evacuationCenterController.list);
router.get('/near', evacuationCenterController.getNear);
router.get('/:id', evacuationCenterController.getById);

router.post('/', verifyToken, requireRole('ADMIN'), evacuationCenterController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), evacuationCenterController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), evacuationCenterController.remove);

module.exports = router;
