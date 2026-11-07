import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsController } from "./notifications.controller.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationRepository } from "./repositories/notification.repository.js";

const mockNotificationRepository = {
  findAll: vitest.fn(),
  create: vitest.fn(),
  findOne: vitest.fn(),
  updateStatus: vitest.fn(),
};

const mockNotificationService = {
  findAll: vitest.fn(),
  create: vitest.fn(),
  findOne: vitest.fn(),
};

describe("NotificationsController", () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationService },
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call findAll on the service", async () => {
    controller.findAll();
    expect(mockNotificationService.findAll).toHaveBeenCalled();
  });
});
