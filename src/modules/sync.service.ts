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
   *  2) Retorna toda la data existente en la BD (users, categories, brands, products, sales) para que
   *     el cliente se actualice localmente también.
   */
  async syncAll(data: any) {
    // 1) Sincronizar Usuarios
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        const userId = u.id?.toString();
        if (!userId) continue; // Si no tiene ID, lo saltamos
        let found = await this.userRepo.findOne({ where: { id: userId } });
        if (!found) {
          // Crear
          await this.userRepo.save({ ...u, id: userId });
        } else {
          // Actualizar (merge si quieres)
          this.userRepo.merge(found, u);
          found.id = userId; // por si era numérico
          await this.userRepo.save(found);
        }
      }
    }

    // 2) Categorías
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        const catId = c.id?.toString();
        if (!catId) continue;
        let found = await this.categoryRepo.findOne({ where: { id: catId } });
        if (!found) {
          await this.categoryRepo.save({ ...c, id: catId });
        } else {
          this.categoryRepo.merge(found, c);
          found.id = catId;
          await this.categoryRepo.save(found);
        }
      }
    }

    // 3) Marcas
    if (Array.isArray(data.brands)) {
      for (const b of data.brands) {
        const brandId = b.id?.toString();
        if (!brandId) continue;
        let found = await this.brandRepo.findOne({ where: { id: brandId } });
        if (!found) {
          await this.brandRepo.save({ ...b, id: brandId });
        } else {
          this.brandRepo.merge(found, b);
          found.id = brandId;
          await this.brandRepo.save(found);
        }
      }
    }

    // 4) Productos
    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        const prodId = p.id?.toString();
        if (!prodId) continue;
        let found = await this.productRepo.findOne({ where: { id: prodId } });
        if (!found) {
          await this.productRepo.save({ ...p, id: prodId });
        } else {
          this.productRepo.merge(found, p);
          found.id = prodId;
          await this.productRepo.save(found);
        }
      }
    }

// 5) Ventas
if (Array.isArray(data.sales)) {
  for (const s of data.sales) {
    const saleId = s.id; // Suponemos que s.id ya viene en el tipo correcto
    if (saleId == null) continue;
    let found = await this.saleRepo.findOne({ where: { id: saleId } });
    if (!found) {
      // Crear la venta, incluyendo paymentMethod. Si no viene, asigna un valor predeterminado.
      const sale = this.saleRepo.create({
        id: saleId,
        date: s.date,
        cashierId: s.cashierId,
        sessionId: s.sessionId,
        total: s.total,
        amountPaid: s.amountPaid,
        change: s.change,
        paymentMethod: s.paymentMethod || 'efectivo'  // Valor por defecto, por ejemplo
      });
      const savedSale = await this.saleRepo.save(sale);

      // Crear items
      if (Array.isArray(s.items)) {
        for (const it of s.items) {
          const saleItem = this.saleItemRepo.create({
            productId: it.productId,
            productName: it.productName,
            price: it.price,
            originalPrice: it.originalPrice,
            quantity: it.quantity,
            sale: savedSale,
          });
          await this.saleItemRepo.save(saleItem);
        }
      }
    } else {
      // Actualizar la venta incluyendo paymentMethod
      this.saleRepo.merge(found, {
        date: s.date,
        cashierId: s.cashierId,
        sessionId: s.sessionId,
        total: s.total,
        amountPaid: s.amountPaid,
        change: s.change,
        paymentMethod: s.paymentMethod || 'efectivo'
      });
      await this.saleRepo.save(found);
      // Nota: Para los items, podrías necesitar lógica adicional según cómo quieras actualizarlos.
    }
  }
}


    // **TWO-WAY**: Retornar toda la data que hay en la BD para que el cliente se actualice
    const allUsers = await this.userRepo.find();
    const allCategories = await this.categoryRepo.find();
    const allBrands = await this.brandRepo.find();
    const allProducts = await this.productRepo.find();
    // Para ventas, trae las relations con 'items'
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
