// product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { OrderMap } from '../common/types';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(limit?: number, offset?: number, orderOptions?: OrderMap): Promise<Product[]> {
    const options: any = {};
    if (limit) options.take = limit;
    if (offset) options.skip = offset;
    if (orderOptions) options.order = orderOptions;
    return this.productRepository.find(options);
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = new Product();
    // Genera un ID si no viene
    product.id = data.id ?? Date.now().toString();

    // Asignar sólo si no es undefined
    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.categoryId !== undefined) product.categoryId = data.categoryId;
    if (data.brandId !== undefined) product.brandId = data.brandId;
    if (data.barcode !== undefined) product.barcode = data.barcode;
    if (data.image !== undefined) product.image = data.image;
    if (data.deleted !== undefined) product.deleted = data.deleted;

    // Manejo de variantes
    const anyData = data as any; // para acceder a data.variants
    if (anyData.variants && Array.isArray(anyData.variants) && anyData.variants.length > 0) {
      product.variantsJson = JSON.stringify(anyData.variants);
      // stock = suma de las variantes
      const sumVariants = anyData.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
      product.stock = sumVariants;
    } else {
      product.variantsJson = null;
      // Asignar stock general si no es undefined
      if (data.stock !== undefined) {
        product.stock = data.stock;
      } else {
        product.stock = 0; // default
      }
    }

    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }

    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.categoryId !== undefined) product.categoryId = data.categoryId;
    if (data.brandId !== undefined) product.brandId = data.brandId;
    if (data.barcode !== undefined) product.barcode = data.barcode;
    if (data.image !== undefined) product.image = data.image;
    if (data.deleted !== undefined) product.deleted = data.deleted;

    const anyData = data as any;
    if (anyData.variants && Array.isArray(anyData.variants) && anyData.variants.length > 0) {
      product.variantsJson = JSON.stringify(anyData.variants);
      const sumVariants = anyData.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
      product.stock = sumVariants;
    } else {
      product.variantsJson = null;
      if (data.stock !== undefined) {
        product.stock = data.stock;
      }
    }

    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<boolean> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return false;
    }
    await this.productRepository.remove(product);
    return true;
  }
}
