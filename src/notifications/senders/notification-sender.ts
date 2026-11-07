import {
  Notification,
  NotificationChannel,
} from "../entities/notification.entity.js";

export interface NotificationSender {
  channel: NotificationChannel;
  send(notification: Notification): Promise<void>;
}
