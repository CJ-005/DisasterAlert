const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const lessonController = require('../controllers/lessonController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

router.get('/', trainingController.list);
router.post('/', verifyToken, requireRole('ADMIN', 'AGENCY'), trainingController.create);

// Literal "lessons" before :id so /lessons/:id is not matched by /:id
router.get('/:trainingId/lessons', lessonController.listByTraining);
router.post('/:trainingId/lessons', verifyToken, requireRole('ADMIN', 'AGENCY'), lessonController.create);
router.get('/lessons/:id', lessonController.getById);
router.put('/lessons/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), lessonController.update);
router.delete('/lessons/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), lessonController.remove);

router.get('/:id/admin', verifyToken, requireRole('ADMIN', 'AGENCY'), trainingController.getById);
router.get('/:id', trainingController.getByIdForUser);
router.put('/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), trainingController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), trainingController.remove);

module.exports = router;
