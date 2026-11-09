import { Test, TestingModule } from "@nestjs/testing";
import { Notification } from "../entities/notification.entity.js";
import { EmailSender, FAILURE_MARKER } from "./email.sender.js";

describe("EmailSender", () => {
  let sender: EmailSender;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: "EmailSender",
          useFactory: () => new EmailSender(10),
        },
      ],
    }).compile();

    sender = module.get<EmailSender>("EmailSender");
  });

  it("should be defined", () => {
    expect(sender).toBeDefined();
  });

  it("should have channel set to 'email'", () => {
    expect(sender.channel).toBe("email");
  });

  it("should send email successfully", async () => {
    const notification = new Notification(
      "1",
      "user@example.com",
      "email",
      "Hello",
      "queued",
    );

    await expect(sender.send(notification)).resolves.toBeUndefined();
  });

  it("should throw for failure marker in message", async () => {
    const notification = new Notification(
      "1",
      "user@example.com",
      "email",
      `Test ${FAILURE_MARKER}`,
      "queued",
    );

    await expect(sender.send(notification)).rejects.toThrow(
      "Delivery failed to user@example.com",
    );
  });

  it("should delay according to simulatedLatencyMs", async () => {
    const fastSender = new EmailSender(5);
    const notification = new Notification(
      "1",
      "user@example.com",
      "email",
      "Hello",
      "queued",
    );

    const start = Date.now();
    await fastSender.send(notification);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(3);
  });
});
