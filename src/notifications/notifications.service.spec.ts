import { Test, TestingModule } from "@nestjs/testing";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

const mockNotificationRepository = {
  findAll: vitest.fn(),
  create: vitest.fn(),
  findOne: vitest.fn(),
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
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a notification", async () => {
    const createNotificationDto: CreateNotificationDto = {
      recipient: "email@email.com",
      channel: "email",
      message: "This is a new notification message.",
    };

    const result = await service.create(createNotificationDto);

    expect(result).toEqual({ id: expect.any(String), status: "queued" });
  });
});
