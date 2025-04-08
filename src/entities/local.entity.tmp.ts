import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Sale } from './sale.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Brand } from './brand.entity';
import { SaleItem } from './sale-item.entity';

@Entity()
export class Local {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // Relación 1-N con Sales
  @OneToMany(() => Sale, (sale) => sale.local, { cascade: true })
  sales: Sale[];

  // Relación 1-N con Users
  @OneToMany(() => User, (user) => user.local, { cascade: true })
  users: User[];

  // Relación 1-N con Stocks
  @OneToMany(() => Product, (stock) => stock.local, { cascade: true })
  stocks: Product[];

  // Relación 1-N con Brands
  @OneToMany(() => Brand, (brand) => brand.local, { cascade: true })
  brands: Brand[];

  // Relación 1-N con SaleItems
  @OneToMany(() => SaleItem, (saleItem) => saleItem.local, { cascade: true })
  saleItems: SaleItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}
