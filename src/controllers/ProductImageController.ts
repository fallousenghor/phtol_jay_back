import { Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { ProductImageService } from '../services/ProductImageService';
import type { CreateProductImage, UpdateProductImage } from '../types/ProductImage';
import { ERROR_MESSAGES } from '../utils/messages/errorMessage';
import { SuccessCode } from '../utils/codes/successCode';
import { ErrorCode } from '../utils/codes/errorCode';
import { createProductImageSchema, updateProductImageSchema } from '../validators/productImageValidator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export class ProductImageController {
  constructor(private productImageService: ProductImageService) {}

  async create(req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> {
    try {
      console.log('req.body:', req.body);
      console.log('req.file:', req.file);
      const productId = z.coerce.number().int().positive().parse(req.body.productId);
      if (!req.file) {
        res.status(ErrorCode.BAD_REQUEST).json({ error: 'Image file is required' });
        return;
      }
      const url = `/uploads/${req.file.filename}`;
      const data = { productId, url };
      const productImage = await this.productImageService.create(data);
      res.status(SuccessCode.CREATED).json(productImage);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(ErrorCode.BAD_REQUEST).json({ error: error.issues });
        return;
      }
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const productImage = await this.productImageService.findById(id);
      if (!productImage) {
        res.status(ErrorCode.NOT_FOUND).json({ error: ERROR_MESSAGES.PRODUCT_IMAGE_NOT_FOUND });
        return;
      }
      res.status(SuccessCode.OK).json(productImage);
    } catch (error) {
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const productImages = await this.productImageService.findAll();
      res.status(SuccessCode.OK).json(productImages);
    } catch (error) {
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data = updateProductImageSchema.parse(req.body);
      const productImage = await this.productImageService.update(id, data);
      res.status(SuccessCode.OK).json(productImage);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(ErrorCode.BAD_REQUEST).json({ error: error.issues });
        return;
      }
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.productImageService.delete(id);
      res.status(SuccessCode.NO_CONTENT).send();
    } catch (error) {
      res.status(ErrorCode.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
  }
}
