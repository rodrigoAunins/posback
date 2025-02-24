import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { OrderMap } from '../common/types';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  findAll(limit?: number, offset?: number, orderOptions?: OrderMap): Promise<Brand[]> {
    const options: any = {};
    if (limit) options.take = limit;
    if (offset) options.skip = offset;
    if (orderOptions) options.order = orderOptions;
    return this.brandRepository.find(options);
  }

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand = this.brandRepository.create(data);
    // si no viene 'id', podrías generarlo
    if (!brand.id) {
      brand.id = Date.now().toString();
    }
    brand.updatedAt = new Date();
    return this.brandRepository.save(brand);
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand not found with id ${id}`);
    }
    Object.assign(brand, data);
    brand.updatedAt = new Date();
    return this.brandRepository.save(brand);
  }

  async delete(id: string): Promise<boolean> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      return false;
    }
    await this.brandRepository.remove(brand);
    return true;
  }
}
