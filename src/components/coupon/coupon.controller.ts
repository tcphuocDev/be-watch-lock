import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@decorators/roles.decorator';
import { RoleEnum } from '@enums/role.enum';
import { CouponService } from './coupon.service';
import { CreateCouponRequest } from './dto/request/create-coupon.request';
import { ListCouponQuery } from './dto/query/list-coupon.query';
import { DetailRequest } from '@utils/detail.request';
import { UpdateCouponRequest } from './dto/request/update-coupon.request';
import { CheckCouponRequest } from './dto/request/check-coupon.request';
import { Public } from '@decorators/public.decorator';

@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Post()
  create(@Body() request: CreateCouponRequest) {
    return this.couponService.create(request);
  }

  @Get()
  list(@Query() request: ListCouponQuery) {
    return this.couponService.list(request);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Get(':id')
  detail(@Param() request: DetailRequest) {
    return this.couponService.detail(request);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  update(@Body() request: UpdateCouponRequest, @Param() param: DetailRequest) {
    return this.couponService.update({ ...request, ...param });
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  delete(@Param() request: DetailRequest) {
    return this.couponService.delete(request);
  }

  @Public()
  @Post('check')
  check(@Body() request: CheckCouponRequest) {
    return this.couponService.check(request);
  }

  @Put(':id/confirm')
  confirm(@Param() request: DetailRequest) {
    return this.couponService.confirm(request);
  }
}
