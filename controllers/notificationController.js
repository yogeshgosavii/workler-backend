import { Notification } from '../models/notificationModule.js';
import mongoose from 'mongoose';

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, related_to, notificationType,actionId, message, contentId } = req.body;

    const newNotification = new Notification({
      userId,
      related_to,
      notificationType,
      message,
      contentId,
      actionId
    });

    const savedNotification = await newNotification.save();
    return { success: true, notification: savedNotification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Error creating notification' };
  }
};

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {

    const notifications = await Notification.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'related_to',
          foreignField: '_id',
          as: 'relatedUser',
        },
      },
      { $unwind: '$relatedUser' },
      {
        $lookup: {
          from: 'posts',
          localField: 'contentId',
          foreignField: '_id',
          as: 'postDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'contentId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'contentId',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'contentId',
          foreignField: '_id',
          as: 'commentDetails',
        },
      },
      
      {
        $addFields: {
          populatedContent: {
            $switch: {
              branches: [
                { case: { $eq: ['$notificationType', 'comment'] }, then: '$postDetails' },
                { case: { $eq: ['$notificationType', 'like'] }, then: '$postDetails' },
                { case: { $eq: ['$notificationType', 'follow'] }, then: '$userDetails' },
                { case: { $eq: ['$notificationType', 'approach'] }, then: '$jobDetails' },
                { case: { $eq: ['$notificationType', 'reply'] }, then: '$commentDetails' },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          message: 1,
          notificationType: 1,
          relatedUser: { username: 1, profileImage: 1 ,_id:1},
          populatedContent: 1,
          actionId : 1,
          read: 1,
          createdAt: 1,
          updatedAt: 1
        },
      },
    ]);

    if (!notifications || notifications.length === 0) {
      return res.status(200).json([]); // Send an empty array if no notifications found
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error });
  }
};

// Get count of unread notifications
const getUserNotificationCount = async (req, res) => {
  try {
    // Log userId to ensure it's being retrieved correctly
    console.log("User ID:", req.user ? req.user._id : null);

    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User ID is missing from request" });
    }

    // Use userId from the logged-in user's request object
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    // Log the count result to verify it
    console.log("Unread notifications count:", unreadCount);

    // Send back the count as JSON
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    res.status(500).json({ message: "Error fetching notification count", error: error.message });
  }
};


// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {

    const updatedNotifications = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: updatedNotifications.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted', notification: deletedNotification });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// Delete all notifications for a user
const deleteAllNotificationsForUser = async (req, res) => {
  try {

    const deletedNotifications = await Notification.deleteMany({ userId: req.user._id });

    res.status(200).json({
      message: 'All notifications deleted',
      deletedCount: deletedNotifications.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ message: 'Error deleting notifications', error: error.message });
  }
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getUserNotificationCount,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotificationsForUser,
};
