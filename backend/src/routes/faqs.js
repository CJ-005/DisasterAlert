const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

// Users read
router.get('/', faqController.list);
router.get('/:id', faqController.getById);

// Admin CRUD
router.post('/', verifyToken, requireRole('ADMIN'), faqController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), faqController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), faqController.remove);
