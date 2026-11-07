import { Injectable } from "@nestjs/common";
import { Notification } from "../entities/notification.entity.js";
import { NotificationRepository } from "./notification.repository.js";

@Injectable()
export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications: Map<string, Notification> = new Map();

  async findAll(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async findById(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async create(notification: Notification): Promise<Notification> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async updateStatus(
    id: string,
    status: Notification["status"],
  ): Promise<void> {
    const notification = this.notifications.get(id);
    if (!notification) {
      console.warn(
        `Cannot update status: notification with id ${id} not found`,
      );
      return;
    }
    notification.status = status;
  }
}
