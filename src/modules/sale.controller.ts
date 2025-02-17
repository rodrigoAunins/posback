import { Controller, Get, Post, Body } from '@nestjs/common';
import { SaleService } from './sale.service';
import { Sale } from '../entities/sale.entity';

@Controller('sales')
export class SaleController {
  constructor(private saleService: SaleService) {}

  @Get()
  findAll(): Promise<Sale[]> {
    return this.saleService.findAll();
  }

  @Post()
  create(@Body() saleData: Partial<Sale>) {
    return this.saleService.create(saleData);
  }
}
