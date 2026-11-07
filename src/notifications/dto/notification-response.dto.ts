import {
  NotificationChannel,
  NotificationStatus,
} from "../entities/notification.entity.js";

export class NotificationResponseDto {
  id: string;
  recipient: string;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;
}
