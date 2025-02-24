import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  findAll(): Promise<Brand[]> {
    return this.brandRepository.find();
  }

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand = this.brandRepository.create(data);
    // si no viene 'id', podrías generarlo (por ejemplo: brand.id = Date.now().toString())
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
