import { Injectable } from "@nestjs/common";
import {
  Notification,
  NotificationChannel,
} from "../entities/notification.entity.js";
import { NotificationSender } from "./notification-sender.js";

export const FAILURE_MARKER = "@fail";

@Injectable()
export class EmailSender implements NotificationSender {
  channel: NotificationChannel = "email";
  private readonly simulatedLatencyMs: number;

  constructor(simulatedLatencyMs: number = 5000) {
    this.simulatedLatencyMs = simulatedLatencyMs;
  }

  async send(notification: Notification): Promise<void> {
    console.log(
      `Sending email to ${notification.recipient}: ${notification.message}`,
    );

    await this.delay(this.simulatedLatencyMs);

    if (notification.message.includes(FAILURE_MARKER)) {
      throw new Error(`Delivery failed to ${notification.recipient}`);
    }

    console.log(`Email delivered to ${notification.recipient}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
