import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { BranchRepository } from '@repositories/branch.repository';
import { CategoryRepository } from '@repositories/category.repository';
import { ItemImageRepository } from '@repositories/item-image.repository';
import { ItemRepository } from '@repositories/item.repository';
import { SpecificationDetailRepository } from '@repositories/specification-detail.repository';
import { SpecificationRepository } from '@repositories/specification.repository';
import { ApiError } from '@utils/api.error';
import { DetailRequest } from '@utils/detail.request';
import { PagingResponse } from '@utils/paging.response';
import { ResponseBuilder } from '@utils/response-builder';
import { ResponsePayload } from '@utils/response-payload';
import { plainToClass } from 'class-transformer';
import { uniq } from 'lodash';
import { Connection, In } from 'typeorm';
import { DetailQuery } from './dto/query/detail.query';
import { ListItemQuery } from './dto/query/list-item.query';
import { CreateItemRequest } from './dto/request/create-item.request';
import { UpdateItemRequest } from './dto/request/update-item.request';
import { DetailItemResponse } from './dto/response/detail-item.response';
import { ListItemResponse } from './dto/response/list-item.response';
import { ItemViewEnum } from './item.constants';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemRepository)
    private readonly itemRepository: ItemRepository,

    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,

    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,

    @InjectRepository(SpecificationRepository)
    private readonly specificationRepository: SpecificationRepository,

    @InjectRepository(SpecificationDetailRepository)
    private readonly specificationDetailRepository: SpecificationDetailRepository,

    @InjectRepository(ItemImageRepository)
    private readonly itemImageRepository: ItemImageRepository,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async create(
    request: CreateItemRequest,
    files: any,
  ): Promise<ResponsePayload<any>> {
    const specificationIds = request.specificationDetails.map(
      (e) => e.specificationId,
    );

    const branch = await this.branchRepository.findOne(request.branchId);
    if (!branch) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const category = await this.categoryRepository.findOne(request.categoryId);
    if (!category) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const specifications = await this.specificationRepository.find({
      id: In(specificationIds),
    });
    if (specifications.length !== uniq(specificationIds).length) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const itemEntity = this.itemRepository.createEntity(request);
      const item = await queryRunner.manager.save(itemEntity);

      const specificationDetailEntities = request.specificationDetails.map(
        (e) =>
          this.specificationDetailRepository.createEntity(
            e.specificationId,
            item.id,
            e.content,
          ),
      );
      await queryRunner.manager.save(specificationDetailEntities);

      const itemImageEntities = files.map((file) =>
        this.itemImageRepository.createEntity(item.id, file.filename),
      );
      await queryRunner.manager.save(itemImageEntities);

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
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.CREATED)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async list(request: ListItemQuery): Promise<ResponsePayload<any>> {
    const [data, count] = await this.itemRepository.list(request);

    const dataReturn = plainToClass(ListItemResponse, data, {
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

  async detail(
    request: DetailRequest & DetailQuery,
  ): Promise<ResponsePayload<any>> {
    const product = await this.itemRepository.detail(request.id);

    if (!product) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const dataReturn = plainToClass(DetailItemResponse, product, {
      excludeExtraneousValues: true,
    });

    if (request.isView === ItemViewEnum.Yes) {
      await this.itemRepository.updateView(request.id);
    }
    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async delete(request: DetailRequest): Promise<any> {
    const product = await this.itemRepository.findOne(request.id);

    if (!product) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    await this.itemRepository.remove(product);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async update(
    request: UpdateItemRequest & DetailRequest,
    files: any,
  ): Promise<ResponsePayload<any>> {
    const item = await this.itemRepository.findOne(request.id);

    if (!item) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const specificationIds = request.specificationDetails.map(
      (e) => e.specificationId,
    );

    const branch = await this.branchRepository.findOne(request.branchId);
    if (!branch) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const category = await this.categoryRepository.findOne(request.categoryId);
    if (!category) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const specifications = await this.specificationRepository.find({
      id: In(specificationIds),
    });
    if (specifications.length !== uniq(specificationIds).length) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    for (const key in request) {
      if (key !== 'id' && key !== 'specificationDetails') {
        item[key] = request[key];
      }
    }

    const specificationMap = new Map();
    const specificationFlag = new Map();

    request.specificationDetails.forEach((e) => {
      specificationMap.set(e.specificationId, e.content);
    });

    const specificationDetailExists =
      await this.specificationDetailRepository.find({
        itemId: item.id,
      });

    const specificationUpdate = [];
    const specificationDelete = [];
    specificationDetailExists.forEach((e) => {
      specificationFlag.set(e.specificationId, true);
      if (
        specificationMap.get(e.specificationId) !== null ||
        specificationMap.get(e.specificationId) !== undefined
      ) {
        e.content = specificationMap.get(e.specificationId);
        specificationUpdate.push(e);
      } else {
        specificationDelete.push(e);
      }
    });

    const itemImageExists = await this.itemImageRepository.find({
      itemId: item.id,
    });
    const imageRemoves = [];
    itemImageExists.forEach((e) => {
      if (!request.keepImages.includes(e.url)) {
        imageRemoves.push(e);
      }
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(specificationUpdate);
      await queryRunner.manager.remove(specificationDelete);

      const specificationDetailEntities = request.specificationDetails
        .map((e) => {
          if (!specificationFlag.get(e.specificationId))
            return this.specificationDetailRepository.createEntity(
              e.specificationId,
              item.id,
              e.content,
            );
          return null;
        })
        .filter((e) => e !== null);
      await queryRunner.manager.save(specificationDetailEntities);

      await queryRunner.manager.save(item);

      await queryRunner.manager.remove(imageRemoves);

      const itemImageEntities = files.map((file) =>
        this.itemImageRepository.createEntity(item.id, file.filename),
      );
      await queryRunner.manager.save(itemImageEntities);

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
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
