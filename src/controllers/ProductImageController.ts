import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ProductImageService } from '../services/ProductImageService';
import type { CreateProductImage, UpdateProductImage } from '../types/ProductImage';
import { ERROR_MESSAGES } from '../utils/messages/errorMessage';
import { SuccessCode } from '../utils/codes/successCode';
import { ErrorCode } from '../utils/codes/errorCode';
import { createProductImageSchema, updateProductImageSchema } from '../validators/productImageValidator';

export class ProductImageController {
  constructor(private productImageService: ProductImageService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createProductImageSchema.parse(req.body);
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
