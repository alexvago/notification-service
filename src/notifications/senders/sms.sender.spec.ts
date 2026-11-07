import { Test, TestingModule } from "@nestjs/testing";
import { Notification } from "../entities/notification.entity.js";
import { FAILURE_MARKER } from "./email.sender.js";
import { SmsSender } from "./sms.sender.js";

describe("SmsSender", () => {
  let sender: SmsSender;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: "SmsSender",
          useFactory: () => new SmsSender(10),
        },
      ],
    }).compile();

    sender = module.get<SmsSender>("SmsSender");
  });

  it("should be defined", () => {
    expect(sender).toBeDefined();
  });

  it("should have channel set to 'sms'", () => {
    expect(sender.channel).toBe("sms");
  });

  it("should send SMS successfully", async () => {
    const notification = new Notification(
      "1",
      "+1234567890",
      "sms",
      "Hello",
      "queued",
    );

    await expect(sender.send(notification)).resolves.toBeUndefined();
  });

  it("should throw for failure marker recipient", async () => {
    const notification = new Notification(
      "1",
      "test@fail.example.com",
      "sms",
      "Hello",
      "queued",
    );

    await expect(sender.send(notification)).rejects.toThrow(
      "Delivery failed: recipient test@fail.example.com is a failure marker",
    );
  });
});
