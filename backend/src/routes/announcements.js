import express from 'express';
const router = express.Router();

// Local imports MUST end with .js
import * as announcementController from '../controllers/announcementController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';

router.get('/', announcementController.list);
router.get('/:id', announcementController.getById);

router.post('/', verifyToken, requireRole('ADMIN'), announcementController.create);
router.put('/:id', verifyToken, requireRole('ADMIN'), announcementController.update);
router.delete('/:id', verifyToken, requireRole('ADMIN'), announcementController.remove);

export default router; // This resolves the "Cannot redeclare" error