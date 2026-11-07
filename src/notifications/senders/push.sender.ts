import { Injectable } from "@nestjs/common";
import {
  Notification,
  NotificationChannel,
} from "../entities/notification.entity.js";
import { FAILURE_MARKER } from "./email.sender.js";
import { NotificationSender } from "./notification-sender.js";

@Injectable()
export class PushSender implements NotificationSender {
  channel: NotificationChannel = "push";
  private readonly simulatedLatencyMs: number;

  constructor(simulatedLatencyMs: number = 5000) {
    this.simulatedLatencyMs = simulatedLatencyMs;
  }

  async send(notification: Notification): Promise<void> {
    console.log(
      `Sending push to ${notification.recipient}: ${notification.message}`,
    );

    await this.delay(this.simulatedLatencyMs);

    if (notification.recipient.includes(FAILURE_MARKER)) {
      throw new Error(
        `Delivery failed: recipient ${notification.recipient} is a failure marker`,
      );
    }

    console.log(`Push delivered to ${notification.recipient}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
