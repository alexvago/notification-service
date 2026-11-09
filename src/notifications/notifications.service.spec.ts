import { Test, TestingModule } from "@nestjs/testing";
import { NotificationDispatcherService } from "./dispatcher/notification-dispatcher.service.js";
import {
  EmptyMessageError,
  InvalidEmailError,
  InvalidPhoneError,
} from "./domain/errors.js";
import { NotificationValidationError } from "./domain/validator.js";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

const mockNotificationRepository = {
  findAll: vitest.fn(),
  create: vitest.fn(),
  findOne: vitest.fn(),
  updateStatus: vitest.fn(),
};

const mockDispatcher = {
  enqueue: vitest.fn(),
};

describe("NotificationsService", () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        {
          provide: NotificationDispatcherService,
          useValue: mockDispatcher,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a notification with valid data", async () => {
    const createNotificationDto: CreateNotificationDto = {
      recipient: "email@email.com",
      channel: "email",
      message: "This is a new notification message.",
    };

    const result = await service.create(createNotificationDto);

    expect(result).toEqual({ id: expect.any(String), status: "queued" });
    expect(mockDispatcher.enqueue).toHaveBeenCalledTimes(1);
  });

  describe("validation", () => {
    beforeEach(() => {
      mockDispatcher.enqueue.mockClear();
      mockNotificationRepository.create.mockClear();
    });

    it("should throw InvalidEmailError for invalid email recipient", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "not-an-email",
        channel: "email",
        message: "Test",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        InvalidEmailError,
      );
      expect(mockDispatcher.enqueue).not.toHaveBeenCalled();
    });

    it("should throw InvalidPhoneError for invalid phone recipient", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "123",
        channel: "sms",
        message: "Test",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        InvalidPhoneError,
      );
      expect(mockDispatcher.enqueue).not.toHaveBeenCalled();
    });

    it("should not enqueue notification when validation fails", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "invalid",
        channel: "email",
        message: "Test",
      };

      await service.create(createNotificationDto).catch(() => {});
      expect(mockDispatcher.enqueue).not.toHaveBeenCalled();
    });

    it("should reject email recipient for SMS channel", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "user@example.com",
        channel: "sms",
        message: "Test",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        InvalidPhoneError,
      );
    });

    it("should reject phone number for email channel", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "+1234567890",
        channel: "email",
        message: "Test",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        InvalidEmailError,
      );
    });

    it("should reject empty recipient for push channel", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "",
        channel: "push",
        message: "Test",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        NotificationValidationError,
      );
    });

    it("should reject empty message regardless of channel", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "user@example.com",
        channel: "email",
        message: "",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        EmptyMessageError,
      );
    });

    it("should reject whitespace-only message", async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipient: "user@example.com",
        channel: "email",
        message: "   ",
      };

      await expect(service.create(createNotificationDto)).rejects.toThrow(
        EmptyMessageError,
      );
    });
  });
});
