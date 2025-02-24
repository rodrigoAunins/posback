import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SaleService } from './sale.service';
import { Sale } from '../entities/sale.entity';
import { OrderMap } from '../common/types';

@Controller('sales')
export class SaleController {
  constructor(private saleService: SaleService) {}

  @Get()
  findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('order') order: string
  ): Promise<Sale[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    let orderOptions: OrderMap | undefined = undefined;
    if (order) {
      const [col, direction] = order.split(':');
      const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderOptions = { [col]: dir };
    }

    return this.saleService.findAll(limitNum, offsetNum, orderOptions);
  }

  @Post()
  create(@Body() saleData: Partial<Sale>) {
    return this.saleService.create(saleData);
  }
}
