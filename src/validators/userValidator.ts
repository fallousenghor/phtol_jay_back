import { z } from 'zod';
import { ERROR_MESSAGES } from '../utils/messages/errorMessage';

export const createUserSchema = z.object({
  userName: z.string().min(1, ERROR_MESSAGES.USER_USERNAME_REQUIRED),
  email: z.string().email(ERROR_MESSAGES.USER_EMAIL_INVALID),
  password: z.string().min(6, ERROR_MESSAGES.USER_PASSWORD_TOO_SHORT),
  role: z.enum(['USER', 'MODERATEUR', 'ADMIN']),
  isVIP: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  userName: z.string().min(1, ERROR_MESSAGES.USER_USERNAME_REQUIRED).optional(),
  email: z.string().email(ERROR_MESSAGES.USER_EMAIL_INVALID).optional(),
  password: z.string().min(6, ERROR_MESSAGES.USER_PASSWORD_TOO_SHORT).optional(),
  role: z.enum(['USER', 'MODERATEUR', 'ADMIN']).optional(),
  isVIP: z.boolean().optional(),
});

export const registerSchema = z.object({
  userName: z.string().min(1, ERROR_MESSAGES.USER_USERNAME_REQUIRED),
  email: z.string().email(ERROR_MESSAGES.USER_EMAIL_INVALID),
  password: z.string().min(6, ERROR_MESSAGES.USER_PASSWORD_TOO_SHORT),
  isVIP: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.USER_EMAIL_INVALID),
  password: z.string().min(1, ERROR_MESSAGES.USER_PASSWORD_REQUIRED),
});
