const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', certificateController.listMy);
router.get('/:trainingId', certificateController.getOne);
router.post('/:trainingId/issue', certificateController.issue);
