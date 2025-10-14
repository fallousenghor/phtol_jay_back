import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { ApiResponse } from '../types/ApiResponse';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.adminService.getAdminStats();
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting admin stats:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      };
      res.status(500).json(response);
    }
  }

  async getPendingProducts(req: Request, res: Response): Promise<void> {
    try {
      const pendingProducts = await this.adminService.getPendingProducts();
      const response: ApiResponse = {
        success: true,
        data: pendingProducts
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting pending products:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de la récupération des produits en attente'
      };
      res.status(500).json(response);
    }
  }

  async approveProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const adminId = (req as any).user.id;

      await this.adminService.approveProduct(productId, adminId);

      const response: ApiResponse = {
        success: true,
        message: 'Produit approuvé avec succès'
      };
      res.json(response);
    } catch (error) {
      console.error('Error approving product:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de l\'approbation du produit'
      };
      res.status(500).json(response);
    }
  }

  async rejectProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const adminId = (req as any).user.id;
      const { reason } = req.body;

      await this.adminService.rejectProduct(productId, adminId, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Produit rejeté avec succès'
      };
      res.json(response);
    } catch (error) {
      console.error('Error rejecting product:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors du rejet du produit'
      };
      res.status(500).json(response);
    }
  }

  async getVipUsers(req: Request, res: Response): Promise<void> {
    try {
      const vipUsers = await this.adminService.getVipUsers();
      const response: ApiResponse = {
        success: true,
        data: vipUsers
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting VIP users:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs VIP'
      };
      res.status(500).json(response);
    }
  }

  async toggleVipStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const adminId = (req as any).user.id;

      await this.adminService.toggleVipStatus(userId, adminId);

      const response: ApiResponse = {
        success: true,
        message: 'Statut VIP modifié avec succès'
      };
      res.json(response);
    } catch (error) {
      console.error('Error toggling VIP status:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de la modification du statut VIP'
      };
      res.status(500).json(response);
    }
  }

  async getRecentModerations(req: Request, res: Response): Promise<void> {
    try {
      const recentModerations = await this.adminService.getRecentModerations();
      const response: ApiResponse = {
        success: true,
        data: recentModerations
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting recent moderations:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erreur lors de la récupération des actions récentes'
      };
      res.status(500).json(response);
    }
  }
}
