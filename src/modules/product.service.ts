import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.productRepo.find();
  }

  create(data: Partial<Product>) {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  // Cambia a 'string'
  async update(id: string, data: Partial<Product>) {
    // OJO, TypeORM 'update()' con id como string
    // Si 'id' es la PK de tipo VARCHAR, usas:
    await this.productRepo.update({ id }, data);

    // Y luego lo buscas:
    return this.productRepo.findOne({ where: { id } });
  }

  // También 'string'
  delete(id: string) {
    return this.productRepo.delete({ id });
  }
}
