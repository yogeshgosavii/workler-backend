import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new notification
router.post('/create', notificationController.createNotification);

// Get notifications for a user
router.get('/user/',protect, notificationController.getUserNotifications);

// Get count of unread notifications for a user
router.get('/user/unread-count',protect, notificationController.getUserNotificationCount);

// Mark a notification as read
router.put('/:notificationId/read',protect, notificationController.markNotificationAsRead);

// Mark all notifications as read for a user
router.put('/user/read-all',protect, notificationController.markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId',protect, notificationController.deleteNotification);

// Delete all notifications for a user
router.delete('/user/delete-all',protect, notificationController.deleteAllNotificationsForUser);

export default router;
