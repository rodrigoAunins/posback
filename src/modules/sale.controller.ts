import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common';
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
    @Query('order') order: string,
    @Query('localId') localId: string, // 👈 agregado
  ): Promise<Sale[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;
    const localIdNum = localId ? parseInt(localId, 10) : undefined;

    let orderOptions: OrderMap | undefined = undefined;
    if (order) {
      const [col, direction] = order.split(':');
      const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderOptions = { [col]: dir };
    }

    return this.saleService.findAll(limitNum, offsetNum, orderOptions, localIdNum); // 👈 agregado
  }

  @Post()
  create(@Body() saleData: Partial<Sale>) {
    return this.saleService.create(saleData);
  }

  @Patch(':id/cancel')
  async cancelSale(@Param('id') saleId: string) {
    console.log(`[Controller] Recibida petición para cancelar venta con ID: ${saleId}`);
    const updatedSale = await this.saleService.cancelSale(saleId);
    console.log(`[Controller] Venta ${saleId} cancelada correctamente. isCancelled=${updatedSale.isCancelled}`);
    return {
      message: `Sale ${saleId} cancelled successfully`,
      cancelledSale: updatedSale,
    };
  }
}
