import { Inject, Injectable } from "@nestjs/common";
import { Notification } from "../entities/notification.entity.js";
import { NotificationRepository } from "../repositories/notification.repository.js";
import type { NotificationSenders } from "../senders/senders.module.js";
import { NOTIFICATION_SENDERS } from "../senders/senders.module.js";

@Injectable()
export class NotificationDispatcherService {
  private readonly queues = new Map<Notification["channel"], Notification[]>();
  private readonly processing = new Map<Notification["channel"], boolean>();

  constructor(
    @Inject(NotificationRepository)
    private readonly repository: NotificationRepository,
    @Inject(NOTIFICATION_SENDERS)
    private readonly senders: NotificationSenders,
  ) {}

  async enqueue(notification: Notification): Promise<void> {
    const channelQueue = this.queues.get(notification.channel) ?? [];
    channelQueue.push(notification);
    this.queues.set(notification.channel, channelQueue);

    if (!this.processing.get(notification.channel)) {
      this.drainChannel(notification.channel);
    }
  }

  private async drainChannel(channel: Notification["channel"]): Promise<void> {
    this.processing.set(channel, true);

    while (true) {
      const queue = this.queues.get(channel);
      if (!queue || queue.length === 0) {
        break;
      }

      const notification = queue.shift();
      if (!notification) continue;

      try {
        const sender = this.senders.get(channel);
        if (!sender) {
          throw new Error(`No sender registered for channel: ${channel}`);
        }
        await sender.send(notification);
        await this.repository.updateStatus(notification.id, "sent");
      } catch (error) {
        console.error(
          `Failed to send notification ${notification.id}: ${error}`,
        );
        await this.repository.updateStatus(notification.id, "failed");
      }
    }

    this.processing.set(channel, false);
  }
}
