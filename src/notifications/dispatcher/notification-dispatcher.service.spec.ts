import { Test, TestingModule } from "@nestjs/testing";
import { Notification } from "../entities/notification.entity.js";
import { InMemoryNotificationRepository } from "../repositories/in-memory.repository.js";
import { NotificationRepository } from "../repositories/notification.repository.js";
import { NotificationSender } from "../senders/notification-sender.js";
import { NOTIFICATION_SENDERS } from "../senders/senders.module.js";
import { NotificationDispatcherService } from "./notification-dispatcher.service.js";

describe("NotificationDispatcherService", () => {
  let service: NotificationDispatcherService;
  let repository: InMemoryNotificationRepository;

  // Track which notification IDs should fail
  const failIds = new Set<string>();

  const createSender = (
    channel: "email" | "sms" | "push",
    delay = 10,
  ): NotificationSender => {
    return {
      channel,
      send: vitest.fn(async (notification: Notification) => {
        if (failIds.has(notification.id)) {
          throw new Error(`Delivery failed to ${notification.recipient}`);
        }
        await new Promise((r) => setTimeout(r, delay));
      }),
    };
  };

  beforeEach(async () => {
    failIds.clear();
    repository = new InMemoryNotificationRepository();

    const senders = new Map([
      ["email", createSender("email")],
      ["sms", createSender("sms")],
      ["push", createSender("push")],
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
      "user@example.com",
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

    // Mark first notification as failed
    failIds.add(failNotification.id);

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

  it("should handle consecutive failures in a queue", async () => {
    const failNotification1 = new Notification(
      "1",
      "user@example.com",
      "email",
      "Fail 1",
      "queued",
    );
    const failNotification2 = new Notification(
      "2",
      "user@example.com",
      "email",
      "Fail 2",
      "queued",
    );
    const successNotification = new Notification(
      "3",
      "user@example.com",
      "email",
      "Success",
      "queued",
    );

    // Mark first two as failed
    failIds.add(failNotification1.id);
    failIds.add(failNotification2.id);

    await repository.create(failNotification1);
    await repository.create(failNotification2);
    await repository.create(successNotification);
    await service.enqueue(failNotification1);
    await service.enqueue(failNotification2);
    await service.enqueue(successNotification);

    // Wait for all to be processed
    await new Promise((r) => setTimeout(r, 150));

    const failed1 = await repository.findById("1");
    const failed2 = await repository.findById("2");
    const succeeded = await repository.findById("3");
    expect(failed1?.status).toBe("failed");
    expect(failed2?.status).toBe("failed");
    expect(succeeded?.status).toBe("sent");
  });
});
