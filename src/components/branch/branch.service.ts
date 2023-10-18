import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchRepository } from '@repositories/branch.repository';
import { ResponseBuilder } from '@utils/response-builder';
import { plainToClass } from 'class-transformer';
import { CreateBranchRequest } from './dto/request/create-branch.request';
import { ListBranchQuery } from './dto/query/list-branch.query';
import { BranchResponse } from './dto/response/branch.response';
import { DetailBranchRequest } from './dto/request/detail-branch.request';
import { UpdateBranchRequest } from './dto/request/update-branch.request';
import { ResponsePayload } from '@utils/response-payload';
import { PagingResponse } from '@utils/paging.response';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}

  async create(request: CreateBranchRequest, files: any): Promise<any> {
    const branchEntity = this.branchRepository.createEntity(request, files);
    const branch = await this.branchRepository.save(branchEntity);
    return new ResponseBuilder(branch)
      .withCode(ResponseCodeEnum.CREATED)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async list(request: ListBranchQuery): Promise<ResponsePayload<any>> {
    const [data, count] = await this.branchRepository.list(request);

    const dataReturn = plainToClass(BranchResponse, data, {
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

  async detail(request: DetailBranchRequest): Promise<any> {
    const branch = await this.branchRepository.findOne({ id: request.id });

    if (!branch) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    const dataReturn = plainToClass(BranchResponse, branch, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async delete(request: DetailBranchRequest): Promise<any> {
    const branch = await this.branchRepository.findOne({ id: request.id });

    if (!branch) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    await this.branchRepository.remove(branch);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async update(
    request: UpdateBranchRequest & DetailBranchRequest,
    files: any,
  ): Promise<any> {
    const branch = await this.branchRepository.findOne({ id: request.id });

    if (!branch) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    for (let key in request) {
      branch[key] = request[key];
    }

    if (files?.length) {
      branch.logo = files[0].filename;
    }

    await this.branchRepository.save(branch);
    return new ResponseBuilder(branch)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
