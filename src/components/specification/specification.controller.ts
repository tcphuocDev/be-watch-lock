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
import { SpecificationService } from './specification.service';
import { CreateSpecificationRequest } from './dto/request/create-specification.request';
import { ListSpecificationQuery } from './dto/query/list-specification.query';
import { DetailRequest } from '@utils/detail.request';
import { UpdateSpecificationRequest } from './dto/request/update-specification.request';

@Controller('specification')
export class SpecificationController {
  constructor(private specificationService: SpecificationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() request: CreateSpecificationRequest) {
    return this.specificationService.create(request);
  }

  @Get()
  list(@Query() request: ListSpecificationQuery) {
    return this.specificationService.list(request);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Get(':id')
  detail(@Param() request: DetailRequest) {
    return this.specificationService.detail(request);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Body() request: UpdateSpecificationRequest,
    @Param() param: DetailRequest,
  ) {
    return this.specificationService.update({ ...request, ...param });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param() request: DetailRequest) {
    return this.specificationService.delete(request);
  }
}
