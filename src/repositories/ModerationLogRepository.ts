import prisma from '../config/db';
import type { ModerationLog, CreateModerationLog, UpdateModerationLog } from '../types/ModerationLog';
import type { Prisma } from '@prisma/client';

export class ModerationLogRepository {
  async create(data: CreateModerationLog): Promise<ModerationLog> {
    const prismaData: Prisma.ModerationLogCreateInput = {
      product: { connect: { id: data.productId } },
      moderator: { connect: { id: data.moderatorId } },
      action: data.action,
      reason: data.reason,
      createdAt: new Date(),
    };
    return prisma.moderationLog.create({ data: prismaData });
  }

  async findById(id: number): Promise<ModerationLog | null> {
    return prisma.moderationLog.findUnique({ where: { id } });
  }

  async findAll(): Promise<ModerationLog[]> {
    return prisma.moderationLog.findMany();
  }

  async findRecent(limit: number = 10): Promise<ModerationLog[]> {
    return prisma.moderationLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        },
        moderator: {
          select: {
            id: true,
            userName: true
          }
        }
      }
    });
  }

  async update(id: number, data: UpdateModerationLog): Promise<ModerationLog> {
    const prismaData: Prisma.ModerationLogUpdateInput = {};
    if (data.productId !== undefined) prismaData.product = { connect: { id: data.productId } };
    if (data.moderatorId !== undefined) prismaData.moderator = { connect: { id: data.moderatorId } };
    if (data.action !== undefined) prismaData.action = data.action;
    if (data.reason !== undefined) prismaData.reason = data.reason;
    return prisma.moderationLog.update({ where: { id }, data: prismaData });
  }

  async delete(id: number): Promise<void> {
    await prisma.moderationLog.delete({ where: { id } });
  }
}
