import { AddressEntity } from '@entities/address.entity';
import { CouponEntity } from '@entities/coupon.entity';
import { ItemEntity } from '@entities/item.entity';
import { OrderDetailEntity } from '@entities/order-detail.entity';
import { UserEntity } from '@entities/user.entity';
import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AddressRepository } from '@repositories/address.repository';
import { CouponRepository } from '@repositories/coupon.repository';
import { ItemRepository } from '@repositories/item.repository';
import { OrderDetailRepository } from '@repositories/order-detail.repository';
import { OrderRepository } from '@repositories/order.repository';
import { UserRepository } from '@repositories/user.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderRepository,
      OrderDetailRepository,
      AddressRepository,
      CouponRepository,
      UserRepository,
      ItemRepository,
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: getRepositoryToken(OrderDetailEntity),
      useClass: OrderDetailRepository,
    },
    {
      provide: getRepositoryToken(ItemEntity),
      useClass: ItemRepository,
    },
    {
      provide: getRepositoryToken(AddressEntity),
      useClass: AddressRepository,
    },
    {
      provide: getRepositoryToken(CouponEntity),
      useClass: CouponRepository,
    },
    {
      provide: getRepositoryToken(UserEntity),
      useClass: UserRepository,
    },
  ],
})
export class OrderModule {}
