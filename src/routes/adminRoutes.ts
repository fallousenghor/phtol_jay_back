import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { Role } from '../types/enums';

const router = Router();
const adminController = new AdminController();

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(authenticate);
router.use(authorize(Role.ADMIN));

// Stats dashboard
router.get('/stats', adminController.getAdminStats.bind(adminController));

// Gestion produits en attente
router.get('/pending-products', adminController.getPendingProducts.bind(adminController));
router.post('/products/:id/approve', adminController.approveProduct.bind(adminController));
router.post('/products/:id/reject', adminController.rejectProduct.bind(adminController));

// Gestion utilisateurs VIP
router.get('/vip-users', adminController.getVipUsers.bind(adminController));
router.post('/users/:id/toggle-vip', adminController.toggleVipStatus.bind(adminController));

// Actions récentes de modération
router.get('/recent-moderations', adminController.getRecentModerations.bind(adminController));

export default router;
