import { describe, expect, it } from "vitest";
import {
  EmptyMessageError,
  InvalidEmailError,
  InvalidPhoneError,
} from "./errors.js";
import { NotificationValidator } from "./validator.js";

describe("NotificationValidator", () => {
  describe("validateChannelRecipientMatch", () => {
    describe("email channel", () => {
      it("should accept valid email addresses", () => {
        const validEmails = [
          "user@example.com",
          "john.doe@company.org",
          "user+tag@domain.co.uk",
          "admin@sub.domain.com",
        ];

        for (const email of validEmails) {
          expect(() =>
            NotificationValidator.validateChannelRecipientMatch("email", email),
          ).not.toThrow();
        }
      });

      it("should reject invalid email addresses", () => {
        const invalidEmails = [
          "not-an-email",
          "@example.com",
          "user@",
          "user@.com",
          "user@com",
          "",
          "user name@example.com",
        ];

        for (const email of invalidEmails) {
          expect(() =>
            NotificationValidator.validateChannelRecipientMatch("email", email),
          ).toThrow(InvalidEmailError);
        }
      });
    });

    describe("sms channel", () => {
      it("should accept valid phone numbers", () => {
        const validPhones = [
          "+1234567890",
          "1234567890",
          "+447911123456",
          "123456789",
          "+9876543210",
        ];

        for (const phone of validPhones) {
          expect(() =>
            NotificationValidator.validateChannelRecipientMatch("sms", phone),
          ).not.toThrow();
        }
      });

      it("should reject invalid phone numbers", () => {
        const invalidPhones = [
          "123",
          "abc1234567",
          "",
          "+0000000000",
          "123-456-7890",
          "(123) 456-7890",
        ];

        for (const phone of invalidPhones) {
          expect(() =>
            NotificationValidator.validateChannelRecipientMatch("sms", phone),
          ).toThrow(InvalidPhoneError);
        }
      });
    });

    describe("push channel", () => {
      it("should accept non-empty recipient strings", () => {
        const validRecipients = [
          "device-token-abc123",
          "user-uuid-1234",
          "fcm-token-xyz",
        ];

        for (const recipient of validRecipients) {
          expect(() =>
            NotificationValidator.validateChannelRecipientMatch(
              "push",
              recipient,
            ),
          ).not.toThrow();
        }
      });

      it("should reject empty or whitespace-only recipients", () => {
        const invalidRecipients = ["", "   ", undefined as unknown as string];

        for (const recipient of invalidRecipients) {
          expect(() =>
            NotificationValidator.validateChannelRecipientMatch(
              "push",
              recipient,
            ),
          ).toThrow();
        }
      });
    });

    it("should throw NotificationValidationError for empty push recipients", () => {
      expect(() =>
        NotificationValidator.validateChannelRecipientMatch("push", ""),
      ).toThrow();
    });
  });

  describe("validate (full DTO)", () => {
    it("should accept valid email notification", () => {
      const dto = {
        recipient: "user@example.com",
        channel: "email" as const,
        message: "Hello world",
      };

      expect(() => NotificationValidator.validate(dto)).not.toThrow();
    });

    it("should accept valid SMS notification", () => {
      const dto = {
        recipient: "+1234567890",
        channel: "sms" as const,
        message: "Hello SMS",
      };

      expect(() => NotificationValidator.validate(dto)).not.toThrow();
    });

    it("should accept valid push notification", () => {
      const dto = {
        recipient: "device-token-123",
        channel: "push" as const,
        message: "Hello push",
      };

      expect(() => NotificationValidator.validate(dto)).not.toThrow();
    });

    it("should throw InvalidEmailError for invalid email", () => {
      const dto = {
        recipient: "not-an-email",
        channel: "email" as const,
        message: "Hello",
      };

      expect(() => NotificationValidator.validate(dto)).toThrow(
        InvalidEmailError,
      );
    });

    it("should throw InvalidPhoneError for invalid phone", () => {
      const dto = {
        recipient: "123",
        channel: "sms" as const,
        message: "Hello",
      };

      expect(() => NotificationValidator.validate(dto)).toThrow(
        InvalidPhoneError,
      );
    });

    it("should throw EmptyMessageError for empty message", () => {
      const dto = {
        recipient: "user@example.com",
        channel: "email" as const,
        message: "",
      };

      expect(() => NotificationValidator.validate(dto)).toThrow(
        EmptyMessageError,
      );
    });

    it("should throw EmptyMessageError for whitespace-only message", () => {
      const dto = {
        recipient: "user@example.com",
        channel: "email" as const,
        message: "   ",
      };

      expect(() => NotificationValidator.validate(dto)).toThrow(
        EmptyMessageError,
      );
    });
  });
});
