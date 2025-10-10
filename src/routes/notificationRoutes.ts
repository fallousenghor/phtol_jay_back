import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationService } from '../services/NotificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';

const router = express.Router();
const repository = new NotificationRepository();
const service = new NotificationService(repository);
const controller = new NotificationController(service);

router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
