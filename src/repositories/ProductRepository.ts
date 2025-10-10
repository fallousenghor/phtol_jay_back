import prisma from '../config/db';
import type { Product, CreateProduct, UpdateProduct } from '../types/Product';
import type { Prisma } from '@prisma/client';

export class ProductRepository {
  async create(data: CreateProduct): Promise<Product> {
    const prismaData: Prisma.ProductCreateInput = {
      title: data.title,
      description: data.description,
      price: data.price,
      user: { connect: { id: data.userId } },
      isApproved: data.isApproved ?? false,
      priority: data.priority ?? false,
      views: data.views ?? 0,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return prisma.product.create({ data: prismaData });
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async findAll(): Promise<Product[]> {
    return prisma.product.findMany();
  }

  async update(id: number, data: UpdateProduct): Promise<Product> {
    const prismaData: Prisma.ProductUpdateInput = {};
    if (data.title !== undefined) prismaData.title = data.title;
    if (data.description !== undefined) prismaData.description = data.description;
    if (data.price !== undefined) prismaData.price = data.price;
    if (data.userId !== undefined) prismaData.user = { connect: { id: data.userId } };
    if (data.isApproved !== undefined) prismaData.isApproved = data.isApproved;
    if (data.priority !== undefined) prismaData.priority = data.priority;
    if (data.views !== undefined) prismaData.views = data.views;
    if (data.expiresAt !== undefined) prismaData.expiresAt = data.expiresAt;
    return prisma.product.update({ where: { id }, data: prismaData });
  }

  async delete(id: number): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
