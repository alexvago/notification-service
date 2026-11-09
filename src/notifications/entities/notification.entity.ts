import { EmptyMessageError } from "../domain/errors.js";

export type NotificationStatus = "queued" | "sent" | "failed";
export type NotificationChannel = "email" | "sms" | "push";

export class Notification {
  id: string;
  recipient: string;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;

  constructor(
    id: string,
    recipient: string,
    channel: NotificationChannel,
    message: string,
    status: NotificationStatus,
  ) {
    // Enforce entity invariants — message must be present
    if (!message?.trim()) {
      throw new EmptyMessageError();
    }

    this.id = id;
    this.recipient = recipient;
    this.channel = channel;
    this.message = message;
    this.status = status;
  }
}
