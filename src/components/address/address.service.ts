import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ResponseBuilder } from '@utils/response-builder';
import { plainToClass } from 'class-transformer';
import { ResponsePayload } from '@utils/response-payload';
import { PagingResponse } from '@utils/paging.response';
import { DetailRequest } from '@utils/detail.request';
import { CreateAddressRequest } from './dto/request/create-address.request';
import { ListAddressQuery } from './dto/query/list-address.query';
import { LocationResponse } from './dto/response/location.response';
import { UpdateAddressRequest } from './dto/request/update-address.request';
import { UserRequest } from '@utils/user.request';
import { AddressRepository } from '@repositories/address.repository';
import { Connection } from 'typeorm';
import { AddressIsMainEnum } from './address.constant';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressRepository)
    private readonly addressRepository: AddressRepository,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async create(request: CreateAddressRequest, user: UserRequest): Promise<any> {
    const addressEntity = this.addressRepository.createEntity(request, user.id);
    let isMainAddressOther;
    if (request.isMain === AddressIsMainEnum.Main) {
      isMainAddressOther = await this.addressRepository.findOne({
        userId: user.id,
      });
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const address = await queryRunner.manager.save(addressEntity);

      if (isMainAddressOther) {
        isMainAddressOther.isMain = AddressIsMainEnum.NotMain;
        await queryRunner.manager.save(isMainAddressOther);
      }
      await queryRunner.commitTransaction();
      return new ResponseBuilder(address)
        .withCode(ResponseCodeEnum.CREATED)
        .withMessage(ResponseMessageEnum.SUCCESS)
        .build();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.BAD_REQUEST)
        .withMessage(err.message)
        .build();
    } finally {
      await queryRunner.release();
    }
  }

  async list(
    request: ListAddressQuery,
    user: UserRequest,
  ): Promise<ResponsePayload<any>> {
    const [data, count] = await this.addressRepository.list(request, user.id);

    const dataReturn = plainToClass(LocationResponse, data, {
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

  async detail(request: DetailRequest, user: UserRequest): Promise<any> {
    const address = await this.addressRepository.findOne({
      id: request.id,
      userId: user.id,
    });

    if (!address) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    const dataReturn = plainToClass(LocationResponse, address, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async delete(request: DetailRequest, user: UserRequest): Promise<any> {
    const address = await this.addressRepository.findOne({
      id: request.id,
      userId: user.id,
    });

    if (!address) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    await this.addressRepository.remove(address);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async update(
    request: UpdateAddressRequest & DetailRequest,
    user: UserRequest,
  ): Promise<any> {
    const address = await this.addressRepository.findOne({
      id: request.id,
      userId: user.id,
    });

    if (!address) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    let isMainAddressOther;
    if (request.isMain === AddressIsMainEnum.Main) {
      isMainAddressOther = await this.addressRepository.findOne({
        userId: user.id,
      });
    }

    for (let key in request) {
      address[key] = request[key];
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(address);

      if (isMainAddressOther) {
        isMainAddressOther.isMain = AddressIsMainEnum.NotMain;
        await queryRunner.manager.save(isMainAddressOther);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.BAD_REQUEST)
        .withMessage(err.message)
        .build();
    } finally {
      await queryRunner.release();
    }

    return new ResponseBuilder(address)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
