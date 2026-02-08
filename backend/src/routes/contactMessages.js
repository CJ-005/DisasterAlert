const express = require('express');
const router = express.Router();
const contactMessageController = require('../controllers/contactMessageController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

// Users submit (optional auth - can allow anonymous with name/email in body)
router.post('/', contactMessageController.create);

// Admin read and mark read
router.get('/', verifyToken, requireRole('ADMIN'), contactMessageController.list);
router.get('/:id', verifyToken, requireRole('ADMIN'), contactMessageController.getById);
router.patch('/:id/read', verifyToken, requireRole('ADMIN'), contactMessageController.markRead);
