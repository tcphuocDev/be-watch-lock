import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseBuilder } from '@utils/response-builder';
import { plainToClass } from 'class-transformer';
import { ResponsePayload } from '@utils/response-payload';
import { PagingResponse } from '@utils/paging.response';
import { CouponRepository } from '@repositories/coupon.repository';
import { CreateCouponRequest } from './dto/request/create-coupon.request';
import { ListCouponQuery } from './dto/query/list-coupon.query';
import { DetailRequest } from '@utils/detail.request';
import { UpdateCouponRequest } from './dto/request/update-coupon.request';
import { CouponResponse } from './dto/response/coupon.response';
import { ApiError } from '@utils/api.error';
import { CheckCouponRequest } from './dto/request/check-coupon.request';
import { CouponStatusEnum } from './coupon.constant';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponRepository)
    private readonly couponRepository: CouponRepository,
  ) {}

  async create(request: CreateCouponRequest): Promise<ResponsePayload<any>> {
    const couponExists = await this.couponRepository.findOne({
      code: request.code,
    });

    if (couponExists) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.CODE_EXISTS,
      ).toResponse();
    }
    const couponEntity = this.couponRepository.createEntity(request);
    const coupon = await this.couponRepository.save(couponEntity);
    return new ResponseBuilder(coupon)
      .withCode(ResponseCodeEnum.CREATED)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async list(request: ListCouponQuery): Promise<ResponsePayload<any>> {
    const [data, count] = await this.couponRepository.list(request);

    const dataReturn = plainToClass(CouponResponse, data, {
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
    const coupon = await this.couponRepository.findOne({
      id: request.id,
    });

    if (!coupon) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    const dataReturn = plainToClass(CouponResponse, coupon, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async delete(request: DetailRequest): Promise<any> {
    const coupon = await this.couponRepository.findOne({
      id: request.id,
    });

    if (!coupon) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    if (coupon.status === CouponStatusEnum.Confirmed) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.BAD_REQUEST)
        .withMessage(ResponseMessageEnum.CAN_NOT_DELETE_CONFIRMED_RECORD)
        .build();
    }

    await this.couponRepository.remove(coupon);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async update(request: UpdateCouponRequest & DetailRequest): Promise<any> {
    const coupon = await this.couponRepository.findOne({
      id: request.id,
    });

    if (!coupon) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    if (coupon.status === CouponStatusEnum.Confirmed) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.BAD_REQUEST)
        .withMessage(ResponseMessageEnum.CAN_NOT_UPDATE_CONFIRMED_RECORD)
        .build();
    }

    for (let key in request) {
      coupon[key] = request[key];
    }

    await this.couponRepository.save(coupon);
    return new ResponseBuilder(coupon)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async check(request: CheckCouponRequest): Promise<any> {
    let status = true;
    const coupon = await this.couponRepository.findOne({
      code: request.code,
      status: CouponStatusEnum.Confirmed,
    });

    if (!coupon) {
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .withMessage(ResponseMessageEnum.NOT_FOUND)
        .build();
    }

    if (coupon.actualQuantity >= coupon.planQuantity) {
      status = false;
    }

    return new ResponseBuilder({
      status,
      id: coupon.id,
      value: coupon.value,
    })
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async confirm(request: DetailRequest): Promise<ResponsePayload<any>> {
    const coupon = await this.couponRepository.findOne({
      id: request.id,
    });

    if (!coupon) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    if (coupon.status === CouponStatusEnum.Confirmed) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.CAN_NOT_UPDATE_STATUS,
      ).toResponse();
    }

    coupon.status = CouponStatusEnum.Confirmed;

    await this.couponRepository.save(coupon);
    return new ResponseBuilder()
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
