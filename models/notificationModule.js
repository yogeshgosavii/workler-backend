// models/Notification.js
import { Schema,model } from 'mongoose';

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // User receiving the notification
  related_to: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // User or event that triggered the notification
  notificationType: {
    type: String,
    enum: ['application','interview', 'message', 'comment','reply', 'like','follow','approach', 'other'],  // Predefined notification types
    required: true,
  },
  message: { type: String, required: true },  // Notification content
  read: { type: Boolean, default: false },    // If notification has been read or not
  contentId: { type: Schema.Types.ObjectId},  // User or event that triggered the notification
}, { timestamps: true });

const Notification = model('Notification', notificationSchema);

export { notificationSchema, Notification };