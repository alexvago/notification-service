// biome-ignore-all lint/complexity/noThisInStatic: clearer than repeating class name

import { CreateNotificationDto } from "../dto/create-notification.dto.js";
import { NotificationChannel } from "../entities/notification.entity.js";
import {
  DomainError,
  EmptyMessageError,
  InvalidEmailError,
  InvalidPhoneError,
} from "./errors.js";

export class NotificationValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "NotificationValidationError";
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: validator pattern is intentional
export class NotificationValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

  static validate(dto: CreateNotificationDto): void {
    // Channel-recipient matching
    this.validateChannelRecipientMatch(dto.channel, dto.recipient);

    // Shared rules
    if (!dto.message?.trim()) {
      throw new EmptyMessageError();
    }
  }

  static validateChannelRecipientMatch(
    channel: NotificationChannel,
    recipient: string,
  ): void {
    switch (channel) {
      case "email":
        if (!this.EMAIL_REGEX.test(recipient)) {
          throw new InvalidEmailError(recipient);
        }
        break;
      case "sms":
        if (!this.PHONE_REGEX.test(recipient)) {
          throw new InvalidPhoneError(recipient);
        }
        break;
      case "push":
        if (!recipient || recipient.trim().length === 0) {
          throw new NotificationValidationError(
            `Push notification requires a non-empty recipient (device token or user ID): "${recipient}"`,
          );
        }
        break;
    }
  }
}
