import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderRepository } from '@repositories/order.repository';
import { ReviewRepository } from '@repositories/review.repository';
import { ApiError } from '@utils/api.error';
import { ResponseBuilder } from '@utils/response-builder';
import { ResponsePayload } from '@utils/response-payload';
import { UserRequest } from '@utils/user.request';
import { CreateReviewRequest } from './dto/request/create-review.request';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewRepository)
    private readonly reviewRepository: ReviewRepository,

    @InjectRepository(OrderRepository)
    private readonly orderRepository: OrderRepository,
  ) {}

  async create(
    request: CreateReviewRequest,
    user: UserRequest,
  ): Promise<ResponsePayload<any>> {
    const order = await this.orderRepository.detailByUserAndItem(
      request.itemId,
      user.id,
    );

    if (!order) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.CANNOT_REVIEW,
      ).toResponse();
    }

    const reviewExist = await this.reviewRepository.findOne({
      itemId: request.itemId,
      userId: user.id,
      orderId: order.id,
    });

    if (reviewExist) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.REVIEW_EXIST,
      ).toResponse();
    }

    const reviewEntity = this.reviewRepository.createEntity(
      request.itemId,
      order.id,
      request.rate,
      user.id,
      request.content,
    );
    const review = await this.reviewRepository.save(reviewEntity);
    return new ResponseBuilder(review)
      .withCode(ResponseCodeEnum.CREATED)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
