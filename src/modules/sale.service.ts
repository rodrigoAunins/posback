import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from '../entities/sale.entity';
import { Repository } from 'typeorm';
import { SaleItem } from '../entities/sale-item.entity';
import { OrderMap } from '../common/types';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepo: Repository<SaleItem>,
  ) {}

  findAll(limit?: number, offset?: number, orderOptions?: OrderMap): Promise<Sale[]> {
    const options: any = {
      relations: ['items'],
    };
    if (limit) options.take = limit;
    if (offset) options.skip = offset;
    if (orderOptions) options.order = orderOptions;

    return this.saleRepo.find(options);
  }

  async create(saleData: Partial<Sale>): Promise<Sale | null> {
    const sale = this.saleRepo.create({
      id: saleData.id, // Se agrega el id enviado desde el cliente
      // Se resta 3 horas a la fecha actual para ajustarse a la zona horaria de Argentina
      date: saleData.date || new Date(Date.now()),
      cashierId: saleData.cashierId,
      sessionId: saleData.sessionId,
      total: saleData.total,
      amountPaid: saleData.amountPaid,
      change: saleData.change,
      paymentMethod: saleData.paymentMethod,
    });
    
    const savedSale = await this.saleRepo.save(sale);

    if (saleData.items && saleData.items.length > 0) {
      const saleItems = saleData.items.map((item) =>
        this.saleItemRepo.create({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          sale: savedSale,
        }),
      );
      await this.saleItemRepo.save(saleItems);
    }

    return this.saleRepo.findOne({
      where: { id: savedSale.id },
      relations: ['items'],
    });
  }

  async cancelSale(saleId: string): Promise<Sale> {
    console.log(`[Service] Buscando venta con ID: ${saleId}`);
    const sale = await this.saleRepo.findOne({
      where: { id: saleId },
    });
    if (!sale) {
      console.error(`[Service] Venta ${saleId} no encontrada`);
      throw new NotFoundException(`Sale not found with id: ${saleId}`);
    }
  
    sale.isCancelled = true;
    console.log(`[Service] Marcando venta ${saleId} como cancelada...`);
    const saved = await this.saleRepo.save(sale);
    console.log(`[Service] Venta ${saleId} guardada con isCancelled=${saved.isCancelled}`);
    return saved;
  }
  


  
}
