const express = require('express');
const router = express.Router();
const riskLayerController = require('../controllers/riskLayerController');
const { verifyToken } = require('../middleware/verifyToken');
const { requireRole } = require('../middleware/requireRole');

// Users fetch by type (optional auth - public map data)
router.get('/', riskLayerController.list);
router.get('/:id', riskLayerController.getById);

// Admin upload / CRUD
router.post('/', verifyToken, requireRole('ADMIN'), riskLayerController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), riskLayerController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), riskLayerController.remove);
