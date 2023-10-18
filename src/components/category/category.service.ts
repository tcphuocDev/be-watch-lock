import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from '@repositories/category.repository';
import { CreateCategoryRequest } from './dto/request/create-category.request';
import { ResponseBuilder } from '@utils/response-builder';
import { ResponseCodeEnum } from '@enums/response-code.enum';
import { GetCategoriesQuery } from './dto/query/get-categories.query';
import { plainToClass } from 'class-transformer';
import { GetCategoriesResponse } from './dto/response/get-categories.response';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { UpdateCategoryRequest } from './dto/request/update-category.request';
import { DetailRequest } from '@utils/detail.request';
import { ResponsePayload } from '@utils/response-payload';
import { PagingResponse } from '@utils/paging.response';
import { ApiError } from '@utils/api.error';
import { ListCategoryQuery } from './dto/query/list-category.query';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async createCategory(request: CreateCategoryRequest): Promise<any> {
    const categoryEntity = this.categoryRepository.createEntity(request);
    const category = await this.categoryRepository.save(categoryEntity);
    return new ResponseBuilder(category)
      .withCode(ResponseCodeEnum.CREATED)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async getCategories(
    request: GetCategoriesQuery,
  ): Promise<ResponsePayload<any>> {
    const [data, count] = await this.categoryRepository.getCategories(request);

    const dataReturn = plainToClass(GetCategoriesResponse, data, {
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

  async getCategory(request: DetailRequest): Promise<any> {
    const category = await this.categoryRepository.findOne({ id: request.id });

    if (!category) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    const dataReturn = plainToClass(GetCategoriesResponse, category, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async deleteCategory(request: DetailRequest): Promise<any> {
    const category = await this.categoryRepository.findOne({ id: request.id });

    if (!category) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    await this.categoryRepository.remove(category);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async updateCategory(
    request: UpdateCategoryRequest & DetailRequest,
  ): Promise<any> {
    const category = await this.categoryRepository.findOne({ id: request.id });

    if (!category) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    for (let key in request) {
      if (key !== 'id') category[key] = request[key];
    }

    await this.categoryRepository.save(category);
    return new ResponseBuilder(category)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
