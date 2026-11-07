import { Notification } from "../entities/notification.entity.js";

export abstract class NotificationRepository {
  abstract findAll(): Promise<Notification[]>;
  abstract findById(id: string): Promise<Notification | undefined>;
  abstract create(notification: Notification): Promise<Notification>;
  abstract updateStatus(
    id: string,
    status: Notification["status"],
  ): Promise<void>;
}
