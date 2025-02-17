import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from '../entities/sale.entity';
import { Repository } from 'typeorm';
import { SaleItem } from '../entities/sale-item.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepo: Repository<SaleItem>,
  ) {}

  findAll(): Promise<Sale[]> {
    return this.saleRepo.find({ relations: ['items'] });
  }

  async create(saleData: Partial<Sale>): Promise<Sale | null> {
    // Creamos la venta
    const sale = this.saleRepo.create({
      date: saleData.date || new Date(),
      cashierId: saleData.cashierId,
      sessionId: saleData.sessionId,
      total: saleData.total,
      amountPaid: saleData.amountPaid,
      change: saleData.change,
    });

    // Guardamos la venta
    const savedSale = await this.saleRepo.save(sale);

    // Guardamos los items
    if (saleData.items && saleData.items.length > 0) {
      const saleItems = saleData.items.map((item) =>
        this.saleItemRepo.create({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          sale: savedSale, // relación
        }),
      );
      await this.saleItemRepo.save(saleItems);
    }

    return this.saleRepo.findOne({
      where: { id: savedSale.id },
      relations: ['items'],
    });
  }
}
