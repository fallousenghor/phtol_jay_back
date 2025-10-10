import express from 'express';
import { ModerationLogController } from '../controllers/ModerationLogController';
import { ModerationLogService } from '../services/ModerationLogService';
import { ModerationLogRepository } from '../repositories/ModerationLogRepository';

const router = express.Router();
const repository = new ModerationLogRepository();
const service = new ModerationLogService(repository);
const controller = new ModerationLogController(service);

router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
