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
    } = params;

    // Creamos QueryBuilder para filtrar en la DB
    const qb = this.brandRepository.createQueryBuilder('brand');

    // Evitar mostrar marcas borradas, si deseas
    qb.where('brand.deleted = false');

    // Filtrar por categoryId
    if (categoryId) {
      qb.andWhere('brand.categoryId = :catId', { catId: categoryId });
    }

    // Filtrar por searchTerm en el nombre
    if (searchTerm) {
      qb.andWhere('brand.name ILIKE :term', { term: `%${searchTerm}%` });
    }

    // Paginación
    if (limit) qb.take(limit);
    if (offset) qb.skip(offset);

    // Orden
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
    // Opcional: si quieres borrado lógico, set brand.deleted = true y save
    await this.brandRepository.remove(brand);
    return true;
  }
}
