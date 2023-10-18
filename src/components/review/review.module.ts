import { OrderEntity } from '@entities/order.entity';
import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from '@repositories/order.repository';
import { ReviewRepository } from '@repositories/review.repository';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewRepository, OrderRepository])],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    {
      provide: getRepositoryToken(OrderEntity),
      useClass: OrderRepository,
    },
  ],
})
export class ReviewModule {}
