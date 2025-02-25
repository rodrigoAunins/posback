import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { OrderMap } from '../common/types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(limit?: number, offset?: number, orderOptions?: OrderMap): Promise<Category[]> {
    const options: any = {};
    if (limit) options.take = limit;
    if (offset) options.skip = offset;
    if (orderOptions) options.order = orderOptions;
    return this.categoryRepository.find(options);
  }

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(data);
    if (!category.id) {
      category.id = Date.now().toString();
    }
    category.updatedAt = new Date();
    return this.categoryRepository.save(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category not found with id ${id}`);
    }
    Object.assign(category, data);
    category.updatedAt = new Date();
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<boolean> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      return false;
    }
    await this.categoryRepository.remove(category);
    return true;
  }
}
