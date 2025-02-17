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
   * 1) Recibe datos del cliente y crea/actualiza en la BD.
   *    Si el registro viene marcado como eliminado (deleted: true),
   *    se actualiza la bandera en la BD (soft delete) en lugar de recrearlo.
   * 2) Retorna toda la data existente (excluyendo los eliminados) para que el cliente se actualice.
   */
  async syncAll(data: any) {
    // 1) Sincronizar Usuarios
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        const userId = u.id?.toString();
        if (!userId) continue;
        let found = await this.userRepo.findOne({ where: { id: userId } });
        if (u.deleted) {
          if (found && !found.deleted && new Date(u.updatedAt) > new Date(found.updatedAt)) {
            found.deleted = true;
            found.updatedAt = u.updatedAt;
            await this.userRepo.save(found);
          }
          continue;
        }
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
        let found = await this.categoryRepo.findOne({ where: { id: catId } });
        if (c.deleted) {
          if (found && !found.deleted && new Date(c.updatedAt) > new Date(found.updatedAt)) {
            found.deleted = true;
            found.updatedAt = c.updatedAt;
            await this.categoryRepo.save(found);
          }
          continue;
        }
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
        let found = await this.brandRepo.findOne({ where: { id: brandId } });
        if (b.deleted) {
          if (found && !found.deleted && new Date(b.updatedAt) > new Date(found.updatedAt)) {
            found.deleted = true;
            found.updatedAt = b.updatedAt;
            await this.brandRepo.save(found);
          }
          continue;
        }
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
        let found = await this.productRepo.findOne({ where: { id: prodId } });
        if (p.deleted) {
          if (found && !found.deleted && new Date(p.updatedAt) > new Date(found.updatedAt)) {
            found.deleted = true;
            found.updatedAt = p.updatedAt;
            await this.productRepo.save(found);
          }
          continue;
        }
        if (!found) {
          await this.productRepo.save({ ...p, id: prodId });
        } else {
          if (found.deleted) { continue; }
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
          }
        }
      }
    }

    const allUsers = await this.userRepo.find({ where: { deleted: false } });
    const allCategories = await this.categoryRepo.find({ where: { deleted: false } });
    const allBrands = await this.brandRepo.find({ where: { deleted: false } });
    const allProducts = await this.productRepo.find({ where: { deleted: false } });
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
