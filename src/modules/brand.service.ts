import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
  ) {}

  findAll() {
    return this.brandRepo.find();
  }

  create(data: Partial<Brand>) {
    const brand = this.brandRepo.create(data);
    return this.brandRepo.save(brand);
  }

  delete(id: number) {
    return this.brandRepo.delete(id);
  }
}
