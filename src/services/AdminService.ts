import { PrismaClient } from '@prisma/client';
import { ModerationLogRepository } from '../repositories/ModerationLogRepository';

export interface AdminStats {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  totalUsers: number;
  vipUsers: number;
  totalViews: number;
  approvalTrends: Array<{
    month: string;
    approvals: number;
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
    const [
      totalProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalUsers,
      vipUsers,
      totalViews,
      approvalTrends
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isApproved: false } }),
      this.prisma.product.count({ where: { isApproved: true } }),
      this.prisma.product.count({ where: { isApproved: false } }), // Note: Need to add rejected status to schema
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isVIP: true } }),
      this.prisma.product.aggregate({
        _sum: { views: true }
      }).then(result => result._sum.views || 0),
      this.getApprovalTrends()
    ]);

    return {
      totalProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalUsers,
      vipUsers,
      totalViews,
      approvalTrends
    };
  }

  private async getApprovalTrends(): Promise<Array<{ month: string; approvals: number; views: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await this.prisma.$queryRaw<Array<{ month: string; approvals: number; views: number }>>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(CASE WHEN "isApproved" = true THEN 1 END) as approvals,
        SUM("views") as views
      FROM "Product"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `;

    return trends.map(trend => ({
      month: trend.month,
      approvals: Number(trend.approvals),
      views: Number(trend.views || 0)
    }));
  }

  async getPendingProducts(): Promise<PendingProduct[]> {
    const products = await this.prisma.product.findMany({
      where: { isApproved: false },
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
        data: { isApproved: true }
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
      // Update product status - Note: Need to add rejected status to schema
      await tx.product.update({
        where: { id: productId },
        data: { isApproved: false } // For now, keep as not approved
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
