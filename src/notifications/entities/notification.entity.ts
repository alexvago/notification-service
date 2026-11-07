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
    this.id = id;
    this.recipient = recipient;
    this.channel = channel;
    this.message = message;
    this.status = status;
  }
}
