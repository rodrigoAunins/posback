import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Sale } from './sale.entity';
  
  @Entity()
  export class SaleItem {
    // Aquí podemos usar auto ID normal (int) interno, o varchar, 
    // o PrimaryGeneratedColumn. Normalmente no es problemático si 
    // es un ID pequeño. Pero si prefieres texto, cámbialo igual.
    @PrimaryGeneratedColumn()
    id: number;
  
    // "productId" y "saleId" se guardan como string
    @Column({ type: 'varchar', length: 50 })
    productId: string;
  
    @Column({ type: 'varchar', length: 200 })
    productName: string;
  
    @Column('float')
    price: number;
  
    @Column('float')
    originalPrice: number;
  
    @Column('int')
    quantity: number;
  
    @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'saleId' })
    sale: Sale;
  }
  