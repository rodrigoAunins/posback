import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';
import { OrderMap } from '../common/types';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('order') order: string
  ): Promise<Product[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    let orderOptions: OrderMap | undefined = undefined;
    if (order) {
      const [col, direction] = order.split(':');
      const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderOptions = { [col]: dir };
    }

    return this.productService.findAll(limitNum, offsetNum, orderOptions);
  }

// product.controller.ts
@Post()
create(@Body() data: Partial<Product>) {
  // data.variants vendrá del frontend
  return this.productService.create(data);
}

@Put(':id')
update(@Param('id') id: string, @Body() data: Partial<Product>) {
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
