import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Category>): Promise<Category> {
    return this.categoryService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Category>): Promise<Category> {
    return this.categoryService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.categoryService.delete(id);
    if (!result) {
      throw new NotFoundException(`Category not found with id ${id}`);
    }
    return { deleted: true };
  }
}
