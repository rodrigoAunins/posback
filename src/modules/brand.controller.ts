import { Controller, Get, Post, Body, Delete, Param, Put, NotFoundException } from '@nestjs/common';
import { BrandService } from './brand.service';
import { Brand } from '../entities/brand.entity';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  findAll(): Promise<Brand[]> {
    return this.brandService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Brand>): Promise<Brand> {
    return this.brandService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Brand>): Promise<Brand> {
    return this.brandService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.brandService.delete(id);
    if (!result) {
      throw new NotFoundException(`Brand not found with id ${id}`);
    }
    return { deleted: true };
  }
}
