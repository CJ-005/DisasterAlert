const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

// Users read (optionally require auth; here we allow public read)
router.get('/', announcementController.list);
router.get('/:id', announcementController.getById);

// Admin CRUD
router.post('/', verifyToken, requireRole('ADMIN'), announcementController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), announcementController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), announcementController.remove);
