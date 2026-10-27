import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController.js';

const router = Router();

router.get('/', auth, getNotifications);
router.patch('/read-all', auth, markAllRead);
router.patch('/:id/read', auth, markAsRead);

export default router;
