import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseBuilder } from '@utils/response-builder';
import { plainToClass } from 'class-transformer';
import { ResponsePayload } from '@utils/response-payload';
import { PagingResponse } from '@utils/paging.response';
import { SpecificationRepository } from '@repositories/specification.repository';
import { CreateSpecificationRequest } from './dto/request/create-specification.request';
import { ListSpecificationQuery } from './dto/query/list-specification.query';
import { DetailRequest } from '@utils/detail.request';
import { UpdateSpecificationRequest } from './dto/request/update-specification.request';
import { SpecificationResponse } from './dto/response/specification.response';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectRepository(SpecificationRepository)
    private readonly specificationRepository: SpecificationRepository,
  ) {}

  async create(request: CreateSpecificationRequest): Promise<any> {
    const specificationEntity =
      this.specificationRepository.createEntity(request);
    const specification = await this.specificationRepository.save(
      specificationEntity,
    );
    return new ResponseBuilder(specification)
      .withCode(ResponseCodeEnum.CREATED)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async list(request: ListSpecificationQuery): Promise<ResponsePayload<any>> {
    const [data, count] = await this.specificationRepository.list(request);

    const dataReturn = plainToClass(SpecificationResponse, data, {
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

  async detail(request: DetailRequest): Promise<any> {
    const specification = await this.specificationRepository.findOne({
      id: request.id,
    });

    if (!specification) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    const dataReturn = plainToClass(SpecificationResponse, specification, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async delete(request: DetailRequest): Promise<any> {
    const specification = await this.specificationRepository.findOne({
      id: request.id,
    });

    if (!specification) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    await this.specificationRepository.remove(specification);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async update(
    request: UpdateSpecificationRequest & DetailRequest,
  ): Promise<any> {
    const specification = await this.specificationRepository.findOne({
      id: request.id,
    });

    if (!specification) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    for (let key in request) {
      specification[key] = request[key];
    }

    await this.specificationRepository.save(specification);
    return new ResponseBuilder(specification)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
