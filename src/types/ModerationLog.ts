import type { Product } from './Product';
import type { User } from './User';
import type { Action } from '@prisma/client';

export interface ModerationLog {
  id: number;
  productId: number;
  product?: Product;
  moderatorId: number;
  moderator?: User;
  action: Action;
  reason: string | null;
  createdAt: Date;
}

export interface CreateModerationLog {
  productId: number;
  moderatorId: number;
  action: Action;
  reason?: string | null;
}

export interface UpdateModerationLog {
  productId?: number;
  moderatorId?: number;
  action?: Action;
  reason?: string | null;
}
