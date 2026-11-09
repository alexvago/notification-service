import { Test, TestingModule } from "@nestjs/testing";
import { Notification } from "../entities/notification.entity.js";
import { FAILURE_MARKER, PushSender } from "./push.sender.js";

describe("PushSender", () => {
  let sender: PushSender;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: "PushSender",
          useFactory: () => new PushSender(10),
        },
      ],
    }).compile();

    sender = module.get<PushSender>("PushSender");
  });

  it("should be defined", () => {
    expect(sender).toBeDefined();
  });

  it("should have channel set to 'push'", () => {
    expect(sender.channel).toBe("push");
  });

  it("should send push notification successfully", async () => {
    const notification = new Notification(
      "1",
      "device-token-abc",
      "push",
      "Hello",
      "queued",
    );

    await expect(sender.send(notification)).resolves.toBeUndefined();
  });

  it("should throw for failure marker in message", async () => {
    const notification = new Notification(
      "1",
      "device-token-abc",
      "push",
      `Test ${FAILURE_MARKER}`,
      "queued",
    );

    await expect(sender.send(notification)).rejects.toThrow(
      "Delivery failed to device-token-abc",
    );
  });
});
