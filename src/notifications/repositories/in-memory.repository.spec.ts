import { Test, TestingModule } from "@nestjs/testing";
import { Notification } from "../entities/notification.entity.js";
import { InMemoryNotificationRepository } from "./in-memory.repository.js";

describe("InMemoryNotificationRepository", () => {
  let repository: InMemoryNotificationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryNotificationRepository],
    }).compile();

    repository = module.get<InMemoryNotificationRepository>(
      InMemoryNotificationRepository,
    );
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should create a notification and find it", async () => {
    const notification = new Notification(
      "1",
      "recipient",
      "email",
      "message",
      "queued",
    );

    const result = await repository.create(notification);

    expect(result).toEqual(notification);
    expect(await repository.findById("1")).toEqual(notification);
  });

  it("should return undefined for non-existing notification", async () => {
    expect(await repository.findById("non-existing-id")).toBeUndefined();
  });

  it("should return all notifications", async () => {
    const notification1 = new Notification(
      "1",
      "recipient1",
      "email",
      "message1",
      "queued",
    );
    const notification2 = new Notification(
      "2",
      "recipient2",
      "sms",
      "message2",
      "queued",
    );

    await repository.create(notification1);
    await repository.create(notification2);

    const allNotifications = await repository.findAll();
    expect(allNotifications).toEqual([notification1, notification2]);
  });
});
