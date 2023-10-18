import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@components/auth/auth.module';
import { CategoryModule } from '@components/category/category.module';
import { CouponModule } from '@components/coupon/coupon.module';
import { ItemModule } from '@components/item/item.module';
import { UserModule } from '@components/user/user.module';
import { AddressModule } from '@components/address/address.module';
import { OrderModule } from '@components/order/order.module';
import { ReviewModule } from '@components/review/review.module';
import { BranchModule } from '@components/branch/branch.module';
import { SpecificationModule } from '@components/specification/specification.module';
import { DashboardModule } from '@components/dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    AuthModule,
    CategoryModule,
    SpecificationModule,
    CouponModule,
    ItemModule,
    UserModule,
    AddressModule,
    OrderModule,
    ReviewModule,
    BranchModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
