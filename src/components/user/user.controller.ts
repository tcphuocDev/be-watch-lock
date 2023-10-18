import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@decorators/roles.decorator';
import { RoleEnum } from '@enums/role.enum';
import { DetailRequest } from '@utils/detail.request';
import { ListUserQuery } from './dto/query/list-user.query';
import { UserService } from './user.service';
import { UpdateUserRequest } from './dto/request/update-role.request';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  list(@Query() request: ListUserQuery) {
    return this.userService.list(request);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  update(
    @Body() request: UpdateUserRequest,
    @Param() param: DetailRequest,
    @Request() req: any,
  ) {
    return this.userService.update({ ...request, ...param }, req.user);
  }
}
