import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { OrderMap } from '../common/types';

interface FindAllParams {
  limit?: number;
  offset?: number;
  orderOptions?: OrderMap;
  searchTerm?: string;
  categoryId?: string;
  localId?: number; // 👈 agregado
}

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll(params: FindAllParams = {}): Promise<Brand[]> {
    const {
      limit,
      offset,
      orderOptions,
      searchTerm,
      categoryId,
      localId, // 👈 agregado
    } = params;

    const qb = this.brandRepository.createQueryBuilder('brand');

    qb.where('brand.deleted = false');

    if (categoryId) {
      qb.andWhere('brand.categoryId = :catId', { catId: categoryId });
    }

    if (searchTerm) {
      qb.andWhere('brand.name ILIKE :term', { term: `%${searchTerm}%` });
    }

    if (localId !== undefined) {
      qb.andWhere('brand.localId = :localId', { localId }); // 👈 agregado
    }

    if (limit) qb.take(limit);
    if (offset) qb.skip(offset);

    if (orderOptions) {
      Object.entries(orderOptions).forEach(([col, dir]) => {
        qb.addOrderBy(`brand.${col}`, dir as 'ASC' | 'DESC');
      });
    }

    return qb.getMany();
  }

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand = this.brandRepository.create(data);

    if (!brand.id) {
      brand.id = Date.now().toString();
    }

    brand.localId = data.localId ?? 1;
    brand.updatedAt = new Date();
    return this.brandRepository.save(brand);
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand not found with id ${id}`);
    }

    Object.assign(brand, data);
    brand.localId = data.localId ?? 1;
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
