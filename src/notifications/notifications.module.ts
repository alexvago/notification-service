import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { InMemoryNotificationRepository } from "./repositories/in-memory.repository.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NotificationRepository,
      useClass: InMemoryNotificationRepository,
    },
  ],
})
export class NotificationsModule {}
