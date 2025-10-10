import express from 'express';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import productImageRoutes from './routes/productImageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import categoryRoutes from './routes/categoryRoutes';
import moderationLogRoutes from './routes/moderationLogRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/product-images', productImageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/categories', categoryRoutes);
router.use('/moderation-logs', moderationLogRoutes);

export default router;
