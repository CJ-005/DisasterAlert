const express = require('express');
const router = express.Router();
const userProgressController = require('../controllers/userProgressController');
const { verifyToken } = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', userProgressController.getByUser);
router.get('/:trainingId', userProgressController.getOne);
router.put('/:trainingId', userProgressController.updateProgress);

module.exports = router;
