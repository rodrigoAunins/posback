import { Controller, Get, Post, Body, Delete, Param, Put, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Product>): Promise<Product> {
    return this.productService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Product>): Promise<Product> {
    return this.productService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.productService.delete(id);
    if (!result) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }
    return { deleted: true };
  }
}
