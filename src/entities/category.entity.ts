import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Local } from './local.entity';

@Entity()
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column({ nullable: true }) // 👈 Esto es lo que te hacía falta
  localId?: number;

  @ManyToOne(() => Local, (local) => local.categories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'localId' })
  local?: Local;
}
