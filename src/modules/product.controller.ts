import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';
import { OrderMap } from '../common/types';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('order') order: string,
    @Query('searchTerm') searchTerm: string,
    @Query('brandId') brandId: string,
    @Query('categoryId') categoryId: string,
    @Query('stockOnly') stockOnly: string
  ): Promise<Product[]> {
    // Parseamos limit/offset
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    // Parseamos order => { col: 'ASC'|'DESC' }
    let orderOptions: OrderMap | undefined;
    if (order) {
      const [col, direction] = order.split(':');
      const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderOptions = { [col]: dir };
    }

    // stockOnly => si es '1' o 'true', lo convertimos a boolean
    const stockOnlyBool = (stockOnly === '1' || stockOnly?.toLowerCase() === 'true');

    return this.productService.findAll({
      limit: limitNum,
      offset: offsetNum,
      orderOptions,
      searchTerm,
      brandId,
      categoryId,
      stockOnly: stockOnlyBool,
    });
  }

  @Post()
  create(@Body() data: Partial<Product>) {
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
