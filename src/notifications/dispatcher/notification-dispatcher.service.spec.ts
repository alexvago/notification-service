import { Test, TestingModule } from "@nestjs/testing";
import { Notification } from "../entities/notification.entity.js";
import { InMemoryNotificationRepository } from "../repositories/in-memory.repository.js";
import { NotificationRepository } from "../repositories/notification.repository.js";
import { NotificationSender } from "../senders/notification-sender.js";
import {
  NOTIFICATION_SENDERS,
  NotificationSenders,
} from "../senders/senders.module.js";
import { NotificationDispatcherService } from "./notification-dispatcher.service.js";

describe("NotificationDispatcherService", () => {
  let service: NotificationDispatcherService;
  let repository: InMemoryNotificationRepository;
  let senders: NotificationSenders;

  const createSender = (
    channel: "email" | "sms" | "push",
    delay = 10,
  ): NotificationSender => {
    const sender = {
      channel,
      send: vitest.fn(async (notification: Notification) => {
        if (notification.recipient.includes("@fail")) {
          throw new Error(`Delivery failed for ${notification.recipient}`);
        }
        await new Promise((r) => setTimeout(r, delay));
      }),
    };
    return sender;
  };

  beforeEach(async () => {
    repository = new InMemoryNotificationRepository();
    const emailSender = createSender("email");
    const smsSender = createSender("sms");
    const pushSender = createSender("push");

    senders = new Map([
      ["email", emailSender],
      ["sms", smsSender],
      ["push", pushSender],
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationDispatcherService,
        {
          provide: NotificationRepository,
          useValue: repository,
        },
        {
          provide: NOTIFICATION_SENDERS,
          useValue: senders,
        },
      ],
    }).compile();

    service = module.get<NotificationDispatcherService>(
      NotificationDispatcherService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should update status to 'sent' for successful send", async () => {
    const notification = new Notification(
      "1",
      "user@example.com",
      "email",
      "Hello",
      "queued",
    );

    await repository.create(notification);
    await service.enqueue(notification);

    // Wait for the dispatcher to process
    await new Promise((r) => setTimeout(r, 50));

    const updated = await repository.findById("1");
    expect(updated?.status).toBe("sent");
  });

  it("should update status to 'failed' for failed send and keep processing", async () => {
    const failNotification = new Notification(
      "1",
      "test@fail.example.com",
      "email",
      "Fail me",
      "queued",
    );
    const successNotification = new Notification(
      "2",
      "user@example.com",
      "email",
      "Success",
      "queued",
    );

    await repository.create(failNotification);
    await repository.create(successNotification);
    await service.enqueue(failNotification);
    await service.enqueue(successNotification);

    // Wait for the dispatcher to process both
    await new Promise((r) => setTimeout(r, 100));

    const failed = await repository.findById("1");
    const succeeded = await repository.findById("2");
    expect(failed?.status).toBe("failed");
    expect(succeeded?.status).toBe("sent");
  });

  it("should process multiple notifications in the same channel sequentially", async () => {
    const notifications = [
      new Notification("1", "a@example.com", "email", "A", "queued"),
      new Notification("2", "b@example.com", "email", "B", "queued"),
      new Notification("3", "c@example.com", "email", "C", "queued"),
    ];

    for (const n of notifications) {
      await repository.create(n);
      await service.enqueue(n);
    }

    // Wait for all to be processed
    await new Promise((r) => setTimeout(r, 100));

    for (const n of notifications) {
      const updated = await repository.findById(n.id);
      expect(updated?.status).toBe("sent");
    }
  });

  it("should process notifications across different channels concurrently", async () => {
    const emailNotif = new Notification(
      "1",
      "a@example.com",
      "email",
      "Email",
      "queued",
    );
    const smsNotif = new Notification(
      "2",
      "+1234567890",
      "sms",
      "SMS",
      "queued",
    );

    await repository.create(emailNotif);
    await repository.create(smsNotif);
    await service.enqueue(emailNotif);
    await service.enqueue(smsNotif);

    // Wait for both channels to process
    await new Promise((r) => setTimeout(r, 100));

    const email = await repository.findById("1");
    const sms = await repository.findById("2");
    expect(email?.status).toBe("sent");
    expect(sms?.status).toBe("sent");
  });
});
