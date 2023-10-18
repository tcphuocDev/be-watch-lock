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
  Request,
  UseGuards,
} from '@nestjs/common';
import { DetailRequest } from '@utils/detail.request';
import { AddressService } from './address.service';
import { CreateAddressRequest } from './dto/request/create-address.request';
import { ListAddressQuery } from './dto/query/list-address.query';
import { UpdateAddressRequest } from './dto/request/update-address.request';

@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() request: CreateAddressRequest, @Request() req: any) {
    return this.addressService.create(request, req.user);
  }

  @Get()
  list(@Query() request: ListAddressQuery, @Request() req: any) {
    return this.addressService.list(request, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  detail(@Param() request: DetailRequest, @Request() req: any) {
    return this.addressService.detail(request, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Body() request: UpdateAddressRequest,
    @Param() param: DetailRequest,
    @Request() req: any,
  ) {
    return this.addressService.update({ ...request, ...param }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param() request: DetailRequest, @Request() req: any) {
    return this.addressService.delete(request, req.user);
  }
}
