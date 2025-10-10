import express from 'express';
import { ProductImageController } from '../controllers/ProductImageController';
import { ProductImageService } from '../services/ProductImageService';
import { ProductImageRepository } from '../repositories/ProductImageRepository';

const router = express.Router();
const repository = new ProductImageRepository();
const service = new ProductImageService(repository);
const controller = new ProductImageController(service);

router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
