const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { verifyToken } = require('../middleware/verifyToken');
const { validateBody } = require('../middleware/validateBody');

router.post('/queue', verifyToken, validateBody({ kind: { required: true, type: 'string', enum: ['PROGRESS', 'RESULT'] }, payload: { required: true, type: 'object' } }), syncController.queue);
router.post('/flush', verifyToken, syncController.flush);

module.exports = router;
