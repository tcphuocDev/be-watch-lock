import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('order_details')
export class OrderDetailEntity {
  @PrimaryColumn()
  itemId: number;

  @PrimaryColumn()
  orderId: number;

  @Column()
  quantity: number;

  @Column()
  price: number;
}
