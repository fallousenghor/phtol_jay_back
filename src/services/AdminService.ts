import { PrismaClient } from '@prisma/client';
import { ModerationLogRepository } from '../repositories/ModerationLogRepository';

export interface AdminStats {
  totalProducts: number;
  pendingApprovals: number;
  expiringProducts: number;
  rejectedToday: number;
  vipActiveProducts: number;
  avgModerationTime: number;
  totalVipUsers: number;
  totalViews: number;
  totalModerations: number;
  recentModerations: ModerationAction[];
  approvalTrends: Array<{
    month: string;
    approvals: number;
  }>;
  viewTrends: Array<{
    month: string;
    views: number;
  }>;
}

export interface PendingProduct {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  user: {
    id: number;
    userName: string;
    email: string;
  };
  images: Array<{
    id: number;
    url: string;
  }>;
}

export interface ModerationAction {
  id: number;
  productTitle: string;
  moderatorName: string;
  action: 'APPROVED' | 'REJECTED';
  date: Date;
  reason?: string;
}

export class AdminService {
  private prisma: PrismaClient;
  private moderationLogRepository: ModerationLogRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.moderationLogRepository = new ModerationLogRepository();
  }

  async getAdminStats(): Promise<AdminStats> {
    // Date pour les photos expirant dans 3 jours
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);

    // Date du début de la journée
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      pendingApprovals,
      expiringProducts,
      rejectedToday,
      vipActiveProducts,
      avgModerationTime,
      totalVipUsers,
      totalViews,
      totalModerations,
      recentModerations,
      approvalTrends,
      viewTrends
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count({
        where: {
          expiresAt: {
            lte: expirationDate,
            gt: new Date()
          },
          status: 'APPROVED'
        }
      }),
      this.prisma.product.count({
        where: {
          status: 'PENDING',
          updatedAt: {
            gte: todayStart
          }
        }
      }),
      this.prisma.product.count({
        where: {
          status: 'APPROVED',
          user: {
            isVIP: true
          }
        }
      }),
      // Calculer le temps moyen entre la création du produit et sa modération
      this.prisma.$queryRaw<[{avg_time: number}]>`
        SELECT AVG(EXTRACT(EPOCH FROM (ml."createdAt" - p."createdAt"))/60)::integer as avg_time
        FROM "ModerationLog" ml
        JOIN "Product" p ON p.id = ml."productId"
        WHERE ml."action" IN ('APPROVED', 'REJECTED')
      `.then(result => result[0]?.avg_time || 0),
      this.prisma.user.count({ where: { isVIP: true } }),
      this.prisma.product.aggregate({
        _sum: { views: true }
      }).then(result => result._sum.views || 0),
      this.prisma.moderationLog.count(),
      this.getRecentModerations(),
      this.getApprovalTrends(),
      this.getViewTrends()
    ]);

    return {
      totalProducts,
      pendingApprovals,
      expiringProducts,
      rejectedToday,
      vipActiveProducts,
      avgModerationTime,
      totalVipUsers,
      totalViews,
      totalModerations,
      recentModerations,
      approvalTrends,
      viewTrends
    };
  }

  private async getApprovalTrends(): Promise<Array<{ month: string; approvals: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await this.prisma.$queryRaw<Array<{ month: string; approvals: number }>>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(CASE WHEN "status" = 'APPROVED' THEN 1 END) as approvals
      FROM "Product"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `;

    return trends.map(trend => ({
      month: trend.month,
      approvals: Number(trend.approvals)
    }));
  }

  private async getViewTrends(): Promise<Array<{ month: string; views: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await this.prisma.$queryRaw<Array<{ month: string; views: number }>>`
      SELECT
        TO_CHAR("updatedAt", 'YYYY-MM') as month,
        SUM("views") as views
      FROM "Product"
      WHERE "updatedAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("updatedAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `;

    return trends.map(trend => ({
      month: trend.month,
      views: Number(trend.views || 0)
    }));
  }

  async getPendingProducts(): Promise<PendingProduct[]> {
    const products = await this.prisma.product.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true
          }
        },
        images: {
          select: {
            id: true,
            url: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      createdAt: product.createdAt,
      user: product.user,
      images: product.images
    }));
  }

  async approveProduct(productId: number, adminId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update product status
      await tx.product.update({
        where: { id: productId },
        data: { status: 'APPROVED' }
      });

      // Log moderation action
      await this.moderationLogRepository.create({
        productId,
        moderatorId: adminId,
        action: 'APPROVED'
      });
    });
  }

  async rejectProduct(productId: number, adminId: number, reason?: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update product status
      await tx.product.update({
        where: { id: productId },
        data: { status: 'REJECTED' }
      });

      // Log moderation action
      await this.moderationLogRepository.create({
        productId,
        moderatorId: adminId,
        action: 'REJECTED',
        reason
      });
    });
  }

  async getVipUsers(): Promise<Array<{ id: number; userName: string; email: string; isVIP: boolean }>> {
    return await this.prisma.user.findMany({
      where: { isVIP: true },
      select: {
        id: true,
        userName: true,
        email: true,
        isVIP: true
      }
    });
  }

  async toggleVipStatus(userId: number, adminId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVIP: true }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isVIP: !user.isVIP }
    });
  }

  async getRecentModerations(limit: number = 10): Promise<ModerationAction[]> {
    const logs = await this.prisma.moderationLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { title: true }
        },
        moderator: {
          select: { userName: true }
        }
      }
    });

    return logs.map(log => ({
      id: log.id,
      productTitle: log.product.title,
      moderatorName: log.moderator.userName,
      action: log.action as 'APPROVED' | 'REJECTED',
      date: log.createdAt,
      reason: log.reason || undefined
    }));
  }
}
