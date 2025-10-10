import type { User } from './User';
import type { ProductImage } from './ProductImage';
import { ModerationLog } from './ModerationLog';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number | null;
  userId: number;
  user?: User;
  isApproved: boolean;
  priority: boolean;
  views: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImage[];
  moderations?: ModerationLog[];
}

export interface CreateProduct {
  title: string;
  description: string;
  price?: number;
  userId: number;
  isApproved?: boolean;
  priority?: boolean;
  views?: number;
  expiresAt: Date;
}

export interface UpdateProduct {
  title?: string;
  description?: string;
  price?: number;
  userId?: number;
  isApproved?: boolean;
  priority?: boolean;
  views?: number;
  expiresAt?: Date;
}
