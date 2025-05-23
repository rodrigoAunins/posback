import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { Local } from './local.entity';

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

  @Column({ type: 'boolean', default: false, nullable: true })
  isCancelled?: boolean;

  @Column({ nullable: true }) // 👈 Igual que arriba, necesario para usar localId
  localId?: number;

  @ManyToOne(() => Local, (local) => local.sales, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'localId' })
  local?: Local;
}
