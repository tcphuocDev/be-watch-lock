import { ItemEntity } from '@entities/item.entity';
import { OrderEntity } from '@entities/order.entity';
import { UserEntity } from '@entities/user.entity';
import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ItemRepository } from '@repositories/item.repository';
import { OrderRepository } from '@repositories/order.repository';
import { UserRepository } from '@repositories/user.repository';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, OrderRepository, ItemRepository]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    {
      provide: getRepositoryToken(UserEntity),
      useClass: UserRepository,
    },
    {
      provide: getRepositoryToken(OrderEntity),
      useClass: OrderRepository,
    },
    {
      provide: getRepositoryToken(ItemEntity),
      useClass: ItemRepository,
    },
  ],
})
export class DashboardModule {}
