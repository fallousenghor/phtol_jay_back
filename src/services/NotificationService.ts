import { NotificationRepository } from '../repositories/NotificationRepository';
import type { Notification, CreateNotification, UpdateNotification } from '../types/Notification';

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async create(data: CreateNotification): Promise<Notification> {
    return this.notificationRepository.create(data);
  }

  async findById(id: number): Promise<Notification | null> {
    return this.notificationRepository.findById(id);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.findAll();
  }

  async update(id: number, data: UpdateNotification): Promise<Notification> {
    return this.notificationRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.notificationRepository.delete(id);
  }
}
