import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";
import { NotificationsService } from "./notifications.service.js";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    return await this.notificationsService.findAll();
  }

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      return await this.notificationsService.create(createNotificationDto);
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const notification = await this.notificationsService.findOne(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }
}
