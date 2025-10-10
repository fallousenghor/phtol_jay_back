import { ModerationLogRepository } from '../repositories/ModerationLogRepository';
import type { ModerationLog, CreateModerationLog, UpdateModerationLog } from '../types/ModerationLog';

export class ModerationLogService {
  constructor(private moderationLogRepository: ModerationLogRepository) {}

  async create(data: CreateModerationLog): Promise<ModerationLog> {
    return this.moderationLogRepository.create(data);
  }

  async findById(id: number): Promise<ModerationLog | null> {
    return this.moderationLogRepository.findById(id);
  }

  async findAll(): Promise<ModerationLog[]> {
    return this.moderationLogRepository.findAll();
  }

  async update(id: number, data: UpdateModerationLog): Promise<ModerationLog> {
    return this.moderationLogRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.moderationLogRepository.delete(id);
  }
}
