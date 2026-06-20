import express from 'express';
import { createNotification, getMyNotifications, markAsRead, markAllAsRead, deleteNotification, broadcastToCourse } from '../controllers/notificationController.js';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAuth);

// All authenticated users
router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Teacher and Admin only
router.post('/', checkRole(['teacher', 'institution_admin']), createNotification);
router.post('/broadcast', checkRole(['teacher', 'institution_admin']), broadcastToCourse);

export default router;
