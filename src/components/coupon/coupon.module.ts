import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponRepository } from '@repositories/coupon.repository';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  imports: [TypeOrmModule.forFeature([CouponRepository])],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
