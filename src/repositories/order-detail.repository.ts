import { OrderDetailEntity } from '@entities/order-detail.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OrderDetailEntity)
export class OrderDetailRepository extends Repository<OrderDetailEntity> {
  createEntity(
    itemId: number,
    orderId: number,
    quantity: number,
    price?: number,
  ): OrderDetailEntity {
    const newEntity = new OrderDetailEntity();
    newEntity.itemId = itemId;
    newEntity.orderId = orderId;
    newEntity.quantity = quantity;
    newEntity.price = price;
    return newEntity;
  }
}
