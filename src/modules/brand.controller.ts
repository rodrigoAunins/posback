import { Controller, Get, Post, Body, Delete, Param, Put, NotFoundException, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { Brand } from '../entities/brand.entity';
import { OrderMap } from '../common/types';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('order') order: string
  ): Promise<Brand[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    let orderOptions: OrderMap | undefined = undefined;
    if (order) {
      const [col, direction] = order.split(':');
      const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderOptions = { [col]: dir };
    }

    return this.brandService.findAll(limitNum, offsetNum, orderOptions);
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
