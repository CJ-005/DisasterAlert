const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const questionController = require('../controllers/questionController');
const choiceController = require('../controllers/choiceController');
const resultController = require('../controllers/resultController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

// Results (specific paths first to avoid :id match)
router.get('/my/results', verifyToken, resultController.listMy);
router.get('/results/:id', verifyToken, resultController.getById);
router.get('/:assessmentId/results', verifyToken, requireRole('ADMIN', 'AGENCY'), resultController.listByAssessment);

// User: get assessment by training (for taking), submit answers
router.get('/training/:trainingId', assessmentController.getByTrainingId);
router.post('/:assessmentId/submit', verifyToken, assessmentController.submit);

// Admin/agency: assessment CRUD
router.post('/', verifyToken, requireRole('ADMIN', 'AGENCY'), assessmentController.create);
router.get('/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), assessmentController.getById);
router.put('/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), assessmentController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), assessmentController.remove);

// Questions (admin) - literal path before :id
router.get('/:assessmentId/questions', verifyToken, requireRole('ADMIN', 'AGENCY'), questionController.listByAssessment);
router.post('/:assessmentId/questions', verifyToken, requireRole('ADMIN', 'AGENCY'), questionController.create);
router.get('/questions/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), questionController.getById);
router.put('/questions/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), questionController.update);
router.delete('/questions/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), questionController.remove);

// Choices (admin)
router.post('/choices', verifyToken, requireRole('ADMIN', 'AGENCY'), choiceController.create);
router.get('/choices/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), choiceController.getById);
router.put('/choices/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), choiceController.update);
router.delete('/choices/:id', verifyToken, requireRole('ADMIN', 'AGENCY'), choiceController.remove);

module.exports = router;
