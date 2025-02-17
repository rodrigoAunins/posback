import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
  ) {}

  /**
   * Sincroniza (two-way):
   *  1) Recibe datos del cliente (offline) y los crea/actualiza en la BD.
   *     Además, si el registro viene marcado como eliminado (deleted: true), se elimina.
   *  2) Retorna toda la data existente en la BD (users, categories, brands, products, sales)
   *     para que el cliente se actualice localmente.
   */
  async syncAll(data: any) {
    // 1) Sincronizar Usuarios
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        const userId = u.id?.toString();
        if (!userId) continue;
        if (u.deleted) {
          const found = await this.userRepo.findOne({ where: { id: userId } });
          if (found) {
            await this.userRepo.remove(found);
          }
          continue;
        }
        let found = await this.userRepo.findOne({ where: { id: userId } });
        if (!found) {
          await this.userRepo.save({ ...u, id: userId });
        } else {
          if (new Date(u.updatedAt) > new Date(found.updatedAt)) {
            this.userRepo.merge(found, u);
            found.id = userId;
            await this.userRepo.save(found);
          }
        }
      }
    }

    // 2) Categorías
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        const catId = c.id?.toString();
        if (!catId) continue;
        if (c.deleted) {
          const found = await this.categoryRepo.findOne({ where: { id: catId } });
          if (found) {
            await this.categoryRepo.remove(found);
          }
          continue;
        }
        let found = await this.categoryRepo.findOne({ where: { id: catId } });
        if (!found) {
          await this.categoryRepo.save({ ...c, id: catId });
        } else {
          if (new Date(c.updatedAt) > new Date(found.updatedAt)) {
            this.categoryRepo.merge(found, c);
            found.id = catId;
            await this.categoryRepo.save(found);
          }
        }
      }
    }

    // 3) Marcas
    if (Array.isArray(data.brands)) {
      for (const b of data.brands) {
        const brandId = b.id?.toString();
        if (!brandId) continue;
        if (b.deleted) {
          const found = await this.brandRepo.findOne({ where: { id: brandId } });
          if (found) {
            await this.brandRepo.remove(found);
          }
          continue;
        }
        let found = await this.brandRepo.findOne({ where: { id: brandId } });
        if (!found) {
          await this.brandRepo.save({ ...b, id: brandId });
        } else {
          if (new Date(b.updatedAt) > new Date(found.updatedAt)) {
            this.brandRepo.merge(found, b);
            found.id = brandId;
            await this.brandRepo.save(found);
          }
        }
      }
    }

    // 4) Productos
    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        const prodId = p.id?.toString();
        if (!prodId) continue;
        if (p.deleted) {
          const found = await this.productRepo.findOne({ where: { id: prodId } });
          if (found) {
            await this.productRepo.remove(found);
          }
          continue;
        }
        let found = await this.productRepo.findOne({ where: { id: prodId } });
        if (!found) {
          await this.productRepo.save({ ...p, id: prodId });
        } else {
          if (new Date(p.updatedAt) > new Date(found.updatedAt)) {
            this.productRepo.merge(found, p);
            found.id = prodId;
            await this.productRepo.save(found);
          }
        }
      }
    }

    // 5) Ventas
    if (Array.isArray(data.sales)) {
      for (const s of data.sales) {
        const saleId = s.id;
        if (saleId == null) continue;
        // Normalmente las ventas no se eliminan, pero se actualizan si corresponde
        let found = await this.saleRepo.findOne({ where: { id: saleId } });
        if (!found) {
          const sale = this.saleRepo.create({
            id: saleId,
            date: s.date,
            cashierId: s.cashierId,
            sessionId: s.sessionId,
            total: s.total,
            amountPaid: s.amountPaid,
            change: s.change,
            paymentMethod: s.paymentMethod || 'efectivo',
            updatedAt: s.updatedAt
          });
          const savedSale = await this.saleRepo.save(sale);
          if (Array.isArray(s.items)) {
            for (const it of s.items) {
              const saleItem = this.saleItemRepo.create({
                productId: it.productId,
                productName: it.productName,
                price: it.price,
                originalPrice: it.originalPrice,
                quantity: it.quantity,
                sale: savedSale,
                updatedAt: it.updatedAt
              });
              await this.saleItemRepo.save(saleItem);
            }
          }
        } else {
          if (new Date(s.updatedAt) > new Date(found.updatedAt)) {
            this.saleRepo.merge(found, {
              date: s.date,
              cashierId: s.cashierId,
              sessionId: s.sessionId,
              total: s.total,
              amountPaid: s.amountPaid,
              change: s.change,
              paymentMethod: s.paymentMethod || 'efectivo',
              updatedAt: s.updatedAt
            });
            await this.saleRepo.save(found);
            // Para los items se podría implementar lógica similar si se requiere actualizar
          }
        }
      }
    }

    // Retornar toda la data de la BD para que el cliente se actualice
    const allUsers = await this.userRepo.find();
    const allCategories = await this.categoryRepo.find();
    const allBrands = await this.brandRepo.find();
    const allProducts = await this.productRepo.find();
    const allSales = await this.saleRepo.find({ relations: ['items'] });

    return {
      success: true,
      message: 'Sync completed',
      users: allUsers,
      categories: allCategories,
      brands: allBrands,
      products: allProducts,
      sales: allSales,
    };
  }
}
