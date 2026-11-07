import { NotificationChannel } from "../entities/notification.entity.js";

export class CreateNotificationDto {
  recipient: string;
  channel: NotificationChannel;
  message: string;
}
