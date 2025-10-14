"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const ModerationLogRepository_1 = require("../repositories/ModerationLogRepository");
class AdminService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.moderationLogRepository = new ModerationLogRepository_1.ModerationLogRepository();
    }
    async getAdminStats() {
        const [totalProducts, pendingProducts, approvedProducts, rejectedProducts, totalUsers, vipUsers, totalViews, approvalTrends] = await Promise.all([
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
    async getApprovalTrends() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const trends = await this.prisma.$queryRaw `
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(CASE WHEN isApproved = true THEN 1 END) as approvals,
        SUM(views) as views
      FROM Product
      WHERE createdAt >= ${sixMonthsAgo}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `;
        return trends.map(trend => ({
            month: trend.month,
            approvals: Number(trend.approvals),
            views: Number(trend.views || 0)
        }));
    }
    async getPendingProducts() {
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
    async approveProduct(productId, adminId) {
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
    async rejectProduct(productId, adminId, reason) {
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
    async getVipUsers() {
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
    async toggleVipStatus(userId, adminId) {
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
    async getRecentModerations(limit = 10) {
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
            action: log.action,
            date: log.createdAt,
            reason: log.reason || undefined
        }));
    }
}
exports.AdminService = AdminService;
