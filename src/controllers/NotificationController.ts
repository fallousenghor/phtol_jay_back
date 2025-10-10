import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { NotificationService } from '../services/NotificationService';
import type { CreateNotification, UpdateNotification } from '../types/Notification';
import { ERROR_MESSAGES } from '../utils/messages/errorMessage';
import { SuccessCode } from '../utils/codes/successCode';
import { ErrorCode } from '../utils/codes/errorCode';
import { createNotificationSchema, updateNotificationSchema } from '../validators/notificationValidator';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createNotificationSchema.parse(req.body);
      const notification = await this.notificationService.create(data);
      res.status(SuccessCode.CREATED).json(notification);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(ErrorCode.BAD_REQUEST).json({ error: error.issues });
        return;
      }
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const notification = await this.notificationService.findById(id);
      if (!notification) {
        res.status(ErrorCode.NOT_FOUND).json({ error: ERROR_MESSAGES.NOTIFICATION_NOT_FOUND });
        return;
      }
      res.status(SuccessCode.OK).json(notification);
    } catch (error) {
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const notifications = await this.notificationService.findAll();
      res.status(SuccessCode.OK).json(notifications);
    } catch (error) {
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data = updateNotificationSchema.parse(req.body);
      const notification = await this.notificationService.update(id, data);
      res.status(SuccessCode.OK).json(notification);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(ErrorCode.BAD_REQUEST).json({ error: error.issues });
        return;
      }
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.notificationService.delete(id);
      res.status(SuccessCode.NO_CONTENT).send();
    } catch (error) {
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }
}
