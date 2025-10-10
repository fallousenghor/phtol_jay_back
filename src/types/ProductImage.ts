import type { Product } from './Product';

export interface ProductImage {
  id: number;
  productId: number;
  product?: Product;
  url: string;
  createdAt: Date;
}

export interface CreateProductImage {
  productId: number;
  url: string;
}

export interface UpdateProductImage {
  productId?: number;
  url?: string;
}
