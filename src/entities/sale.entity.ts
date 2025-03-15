import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity()
export class Sale {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 50 })
  cashierId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sessionId?: string;

  @Column('float')
  total: number;

  @Column('float')
  amountPaid: number;

  @Column('float')
  change: number;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // NUEVO: indica si la venta está cancelada
  @Column({ type: 'boolean', default: false, nullable: true })
  isCancelled?: boolean;
}