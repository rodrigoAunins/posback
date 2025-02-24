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

  findAll(limit?: number, offset?: number, orderOptions?: OrderMap): Promise<Product[]> {
    const options: any = {};
    if (limit) options.take = limit;
    if (offset) options.skip = offset;
    if (orderOptions) options.order = orderOptions;
    return this.productRepository.find(options);
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    if (!product.id) {
      product.id = Date.now().toString();
    }
    product.updatedAt = new Date();
    return this.productRepository.save(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }
    Object.assign(product, data);
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
