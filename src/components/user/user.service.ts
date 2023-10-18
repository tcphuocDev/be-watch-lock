import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseBuilder } from '@utils/response-builder';
import { plainToClass } from 'class-transformer';
import { ResponsePayload } from '@utils/response-payload';
import { PagingResponse } from '@utils/paging.response';
import { DetailRequest } from '@utils/detail.request';
import { ApiError } from '@utils/api.error';
import { ListUserQuery } from './dto/query/list-user.query';
import { UpdateUserRequest } from './dto/request/update-role.request';
import { UserRepository } from '@repositories/user.repository';
import { UserRequest } from '@utils/user.request';
import { UserResponse } from './dto/response/user.response';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async list(request: ListUserQuery): Promise<ResponsePayload<any>> {
    const [data, count] = await this.userRepository.list(request);

    const dataReturn = plainToClass(UserResponse, data, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder<PagingResponse>({
      items: dataReturn,
      meta: {
        total: count,
        page: request.page,
      },
    })
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async update(
    request: UpdateUserRequest & DetailRequest,
    currentUser: UserRequest,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      id: request.id,
    });

    if (!user) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    if (user.id === currentUser.id) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.CANNOT_UPDATE_CURRENT,
      ).toResponse();
    }

    for (let key in request) {
      user[key] = request[key];
    }

    await this.userRepository.save(user);
    return new ResponseBuilder(user)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
