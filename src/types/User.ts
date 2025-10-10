import type { Role } from '@prisma/client';
import { ModerationLog } from './ModerationLog';
import type { Notification } from './Notification';
import { Product } from './Product';

export interface User {
  id: number;
  userName: string;
  email: string;
  password: string;
  role: Role;
  isVIP: boolean;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
  notifications?: Notification[];
  moderations?: ModerationLog[];
}

export interface CreateUser {
  userName: string;
  email: string;
  password: string;
  role: Role;
  isVIP?: boolean;
}

export interface UpdateUser {
  userName?: string;
  email?: string;
  password?: string;
  role?: Role;
  isVIP?: boolean;
}
