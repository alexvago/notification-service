import { Module } from "@nestjs/common";
import { NotificationDispatcherService } from "./dispatcher/notification-dispatcher.service.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { InMemoryNotificationRepository } from "./repositories/in-memory.repository.js";
import { NotificationRepository } from "./repositories/notification.repository.js";
import { SendersModule } from "./senders/senders.module.js";

@Module({
  imports: [SendersModule.register()],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationDispatcherService,
    {
      provide: NotificationRepository,
      useClass: InMemoryNotificationRepository,
    },
  ],
})
export class NotificationsModule {}
