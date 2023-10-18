import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
import { Public } from '@decorators/public.decorator';
import { Roles } from '@decorators/roles.decorator';
import { RoleEnum } from '@enums/role.enum';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DetailRequest } from '@utils/detail.request';
import { ListOrderQuery } from './dto/query/list-order.query';
import { ChangeStatusRequest } from './dto/request/change-status.request';
import { CheckoutOrderPublicRequest } from './dto/request/checkout-order.public.request';
import { CheckoutOrderRequest } from './dto/request/checkout-order.request';
import { CreateOrderRequest } from './dto/request/create-order.request';
import { UpdateOrderRequest } from './dto/request/update-order.request';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() request: CreateOrderRequest, @Request() req: any) {
    return this.orderService.create(request, req.user);
  }

  @Get()
  list(@Query() request: ListOrderQuery, @Request() req: any) {
    return this.orderService.list(request, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  detail(@Param() request: DetailRequest) {
    return this.orderService.detail(request);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Body() request: UpdateOrderRequest,
    @Param() param: DetailRequest,
    @Request() req: any,
  ) {
    return this.orderService.update({ ...request, ...param }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Put(':id/change-status')
  changeStatus(
    @Body() request: ChangeStatusRequest,
    @Param() param: DetailRequest,
  ) {
    return this.orderService.changeStatus({ ...request, ...param });
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@Body() request: CheckoutOrderRequest, @Request() req: any) {
    return this.orderService.checkout(request, req.user);
  }

  @Public()
  @Post('checkout-public')
  checkoutPublic(@Body() request: CheckoutOrderPublicRequest) {
    return this.orderService.checkoutPublic(request);
  }
}
