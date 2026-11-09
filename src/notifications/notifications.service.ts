import crypto from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { NotificationDispatcherService } from "./dispatcher/notification-dispatcher.service.js";
import { NotificationValidator } from "./domain/validator.js";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";
import { Notification } from "./entities/notification.entity.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NotificationRepository)
    private readonly repository: NotificationRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    // Domain validation — fail fast before touching infrastructure
    NotificationValidator.validate(createNotificationDto);

    const uuid = crypto.randomUUID();
    const notification = new Notification(
      uuid,
      createNotificationDto.recipient,
      createNotificationDto.channel,
      createNotificationDto.message,
      "queued",
    );
    await this.repository.create(notification);

    // Fire-and-forget enqueue: dispatcher will update status to sent/failed
    void this.dispatcher.enqueue(notification);

    return { id: notification.id, status: notification.status };
  }

  async findAll(): Promise<Notification[]> {
    return await this.repository.findAll();
  }

  async findOne(id: string): Promise<Notification | undefined> {
    return await this.repository.findById(id);
  }
}
