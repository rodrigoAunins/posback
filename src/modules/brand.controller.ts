import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { BrandService } from './brand.service';
import { Brand } from '../entities/brand.entity';

@Controller('brands')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Get()
  findAll(): Promise<Brand[]> {
    return this.brandService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Brand>) {
    return this.brandService.create(data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.brandService.delete(id);
  }
}
