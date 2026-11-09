import { describe, expect, it } from "vitest";
import { EmptyMessageError } from "../domain/errors.js";
import { Notification } from "./notification.entity.js";

describe("Notification entity", () => {
  it("should create a valid notification", () => {
    const notification = new Notification(
      "test-id",
      "user@example.com",
      "email",
      "Hello world",
      "queued",
    );

    expect(notification).toBeDefined();
    expect(notification.id).toBe("test-id");
    expect(notification.recipient).toBe("user@example.com");
    expect(notification.channel).toBe("email");
    expect(notification.message).toBe("Hello world");
    expect(notification.status).toBe("queued");
  });

  it("should throw EmptyMessageError for empty message", () => {
    expect(() => {
      new Notification("test-id", "user@example.com", "email", "", "queued");
    }).toThrow(EmptyMessageError);
  });

  it("should throw EmptyMessageError for whitespace-only message", () => {
    expect(() => {
      new Notification("test-id", "user@example.com", "email", "   ", "queued");
    }).toThrow(EmptyMessageError);
  });

  it("should throw EmptyMessageError for undefined message", () => {
    expect(() => {
      new Notification(
        "test-id",
        "user@example.com",
        "email",
        undefined as unknown as string,
        "queued",
      );
    }).toThrow(EmptyMessageError);
  });
});
