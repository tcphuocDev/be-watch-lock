import { AddressIsMainEnum } from '@components/address/address.constant';
import { CouponStatusEnum } from '@components/coupon/coupon.constant';
import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { AddressRepository } from '@repositories/address.repository';
import { CouponRepository } from '@repositories/coupon.repository';
import { ItemRepository } from '@repositories/item.repository';
import { OrderDetailRepository } from '@repositories/order-detail.repository';
import { OrderRepository } from '@repositories/order.repository';
import { UserRepository } from '@repositories/user.repository';
import { ApiError } from '@utils/api.error';
import { DetailRequest } from '@utils/detail.request';
import { PagingResponse } from '@utils/paging.response';
import { ResponseBuilder } from '@utils/response-builder';
import { ResponsePayload } from '@utils/response-payload';
import { UserRequest } from '@utils/user.request';
import { plainToClass } from 'class-transformer';
import { Connection, In } from 'typeorm';
import { ListOrderQuery } from './dto/query/list-order.query';
import { ChangeStatusRequest } from './dto/request/change-status.request';
import { CheckoutOrderPublicRequest } from './dto/request/checkout-order.public.request';
import { CheckoutOrderRequest } from './dto/request/checkout-order.request';
import { CreateOrderRequest } from './dto/request/create-order.request';
import { UpdateOrderRequest } from './dto/request/update-order.request';
import { DetailOrderResoponse } from './dto/response/detail-order.response';
import { OrderStatusEnum } from './order.constant';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderRepository)
    private readonly orderRepository: OrderRepository,

    @InjectRepository(OrderDetailRepository)
    private readonly orderDetailRepository: OrderDetailRepository,

    @InjectRepository(ItemRepository)
    private readonly itemRepository: ItemRepository,

    @InjectRepository(AddressRepository)
    private readonly addressRepository: AddressRepository,

    @InjectRepository(CouponRepository)
    private readonly couponRepository: CouponRepository,

    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async create(
    request: CreateOrderRequest,
    user: UserRequest,
  ): Promise<ResponsePayload<any>> {
    const myOrderInCart = await this.orderRepository.findOne({
      userId: user.id,
      status: OrderStatusEnum.INCART,
    });

    if (myOrderInCart) {
      return await this.update({ ...request, id: myOrderInCart.id }, user);
    }

    const itemIds = request.items.map((item) => item.itemId);
    const items = await this.itemRepository.find({
      id: In(itemIds),
    });

    if (itemIds.length !== items.length) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const orderEntity = this.orderRepository.createEntity(user.id);

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await queryRunner.manager.save(orderEntity);

      const orderDetailEntities = request.items.map((item) =>
        this.orderDetailRepository.createEntity(
          item.itemId,
          order.id,
          item.quantity,
        ),
      );

      await queryRunner.manager.save(orderDetailEntities);

      await queryRunner.commitTransaction();
      return new ResponseBuilder()
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

  async update(
    request: UpdateOrderRequest & DetailRequest,
    user: UserRequest,
  ): Promise<ResponsePayload<any>> {
    const myOrderInCart = await this.orderRepository.findOne({
      userId: user.id,
      status: OrderStatusEnum.INCART,
    });
    const myOrderDetailInCart = await this.orderDetailRepository.find({
      orderId: myOrderInCart.id,
    });

    const itemIds = request.items.map((item) => item.itemId);
    const items = await this.itemRepository.find({
      id: In(itemIds),
    });

    if (itemIds.length !== items.length) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const orderDetailEntities = request.items.map((item) =>
        this.orderDetailRepository.createEntity(
          item.itemId,
          myOrderInCart.id,
          item.quantity,
        ),
      );

      await queryRunner.manager.remove(myOrderDetailInCart);
      await queryRunner.manager.save(orderDetailEntities);

      await queryRunner.commitTransaction();
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.SUCCESS)
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

  async checkout(
    request: CheckoutOrderRequest,
    user: UserRequest,
  ): Promise<ResponsePayload<any>> {
    const myOrderInCart = await this.orderRepository.findOne({
      userId: user.id,
      status: OrderStatusEnum.INCART,
      id: request.id,
    });

    if (!myOrderInCart) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const myOrderDetailInCarts = await this.orderDetailRepository.find({
      orderId: myOrderInCart.id,
    });

    const itemIds = myOrderDetailInCarts.map((e) => e.itemId) || [];

    const items = await this.itemRepository.find({
      id: In(itemIds),
    });

    if (itemIds.length !== items.length) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.ITEM_RULE_NOT_FOUND,
      ).toResponse();
    }

    const itemMap = new Map();
    const itemInCartMap = new Map();
    const itemQuantityInvalid = [];
    myOrderDetailInCarts.forEach((e) => {
      itemInCartMap.set(e.itemId, e.quantity);
    });

    items.forEach((item) => {
      itemMap.set(item.id, item);
      item.stockQuantity = item.stockQuantity - itemInCartMap.get(item.id) || 0;
      if (item.stockQuantity < 0) {
        itemQuantityInvalid.push(item.id);
      }
    });

    if (itemQuantityInvalid.length) {
      return new ResponseBuilder({
        items: itemQuantityInvalid,
      })
        .withCode(ResponseCodeEnum.BAD_REQUEST)
        .withMessage(ResponseMessageEnum.INVALID_QUANTITY)
        .build();
    }

    const currentUserAddress = await this.addressRepository.findOne({
      userId: user.id,
    });

    if (!currentUserAddress) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.INVALID_ADDRESS,
      ).toResponse();
    }

    const coupon = await this.couponRepository.findOne({
      id: request.couponId,
      status: CouponStatusEnum.Confirmed,
    });

    if (
      request.couponId &&
      coupon &&
      coupon.planQuantity <= coupon.actualQuantity
    ) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.INVALID_COUPON,
      ).toResponse();
    }

    if (coupon) coupon.actualQuantity++;

    myOrderInCart.address = currentUserAddress.address;
    myOrderInCart.phone = user.phone;

    myOrderDetailInCarts.forEach((e) => {
      e.price = itemMap.get(e.itemId).salePrice || itemMap.get(e.itemId).price;
    });

    myOrderInCart.status = OrderStatusEnum.WAITING_CONFIRM;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(myOrderInCart);
      await queryRunner.manager.save(myOrderDetailInCarts);
      await queryRunner.manager.save(items);
      if (coupon) await queryRunner.manager.save(coupon);

      await queryRunner.commitTransaction();
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.SUCCESS)
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

  async changeStatus(
    request: ChangeStatusRequest & DetailRequest,
  ): Promise<ResponsePayload<any>> {
    const order = await this.orderRepository.findOne(request.id);

    if (!order) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    let flag = true;
    let isReject = false;
    switch (request.status) {
      case OrderStatusEnum.CONFIRMED:
        if (order.status === OrderStatusEnum.WAITING_CONFIRM)
          order.status = OrderStatusEnum.CONFIRMED;
        else flag = false;
        break;
      case OrderStatusEnum.SHIPPING:
        if (order.status === OrderStatusEnum.CONFIRMED)
          order.status = OrderStatusEnum.SHIPPING;
        else flag = false;
        break;
      case OrderStatusEnum.RECEIVED:
        if (order.status === OrderStatusEnum.SHIPPING)
          order.status = OrderStatusEnum.RECEIVED;
        else flag = false;
        break;
      case OrderStatusEnum.SUCCESS:
        if (order.status === OrderStatusEnum.RECEIVED)
          order.status = OrderStatusEnum.SUCCESS;
        else flag = false;
        break;
      case OrderStatusEnum.REJECT:
        if (order.status === OrderStatusEnum.WAITING_CONFIRM) isReject = true;
        else flag = false;
        break;

      default:
        break;
    }

    if (!flag) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.INVALID_STATUS,
      ).toResponse();
    }

    let items = [];
    if (isReject) {
      const orderDetails = await this.orderDetailRepository.find({
        orderId: order.id,
      });

      const orderDetailMap = new Map();
      const itemIds = [];
      orderDetails.forEach((e) => {
        itemIds.push(e.itemId);
        orderDetailMap.set(e.itemId, e.quantity);
      });

      items = await this.itemRepository.find({
        id: In(itemIds),
      });

      items.forEach((e) => {
        e.stockQuantity = e.stockQuantity + orderDetailMap.get(e.id) || 0;
      });

      order.status = OrderStatusEnum.REJECT;
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(order);
      if (items.length) await queryRunner.manager.save(items);

      await queryRunner.commitTransaction();
      return new ResponseBuilder()
        .withCode(ResponseCodeEnum.SUCCESS)
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

  async detail(request: DetailRequest): Promise<ResponsePayload<any>> {
    const order = await this.orderRepository.detail(request);

    if (!order) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const dataReturn = plainToClass(DetailOrderResoponse, order, {
      excludeExtraneousValues: true,
    });

    return new ResponseBuilder(dataReturn)
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async list(
    request: ListOrderQuery,
    user: UserRequest,
  ): Promise<ResponsePayload<any>> {
    const [data, count] = await this.orderRepository.list(request, user.id);

    const dataReturn = plainToClass(DetailOrderResoponse, data, {
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

  async checkoutPublic(
    request: CheckoutOrderPublicRequest,
  ): Promise<ResponsePayload<any>> {
    const userExist = await this.userRepository.findOne({
      phone: request.phone,
    });

    let uId = userExist?.id;

    const itemIds = request.items.map((item) => item.itemId);
    const items = await this.itemRepository.find({
      id: In(itemIds),
    });

    if (itemIds.length !== items.length) {
      return new ApiError(
        ResponseCodeEnum.NOT_FOUND,
        ResponseMessageEnum.NOT_FOUND,
      ).toResponse();
    }

    const coupon = await this.couponRepository.findOne({
      id: request.couponId,
      status: CouponStatusEnum.Confirmed,
    });

    if (
      request.couponId &&
      coupon &&
      coupon.planQuantity <= coupon.actualQuantity
    ) {
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.INVALID_COUPON,
      ).toResponse();
    }

    if (coupon) coupon.actualQuantity++;

    const itemMap = new Map();
    const itemInCartMap = new Map();
    const itemQuantityInvalid = [];
    request.items.forEach((e) => {
      itemInCartMap.set(e.itemId, e.quantity);
    });

    items.forEach((item) => {
      itemMap.set(item.id, item);
      item.stockQuantity = item.stockQuantity - itemInCartMap.get(item.id) || 0;
      if (item.stockQuantity < 0) {
        itemQuantityInvalid.push(item.id);
      }
    });

    if (itemQuantityInvalid.length) {
      return new ResponseBuilder({
        items: itemQuantityInvalid,
      })
        .withCode(ResponseCodeEnum.BAD_REQUEST)
        .withMessage(ResponseMessageEnum.INVALID_QUANTITY)
        .build();
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!userExist) {
        const userEntity = this.userRepository.createEntityPublic(
          request.phone,
          request.fullname,
          request.gender,
          request.email,
        );
        const user = await queryRunner.manager.save(userEntity);
        uId = user.id;
      }

      const orderEntity = this.orderRepository.createEntity(
        uId,
        request.phone,
        request.address,
        OrderStatusEnum.WAITING_CONFIRM,
        request.note,
        request.couponId,
      );
      const order = await queryRunner.manager.save(orderEntity);
      if (coupon) await queryRunner.manager.save(coupon);

      const address = await this.addressRepository.findOne({
        address: request.address,
        userId: uId,
      });

      if (!address) {
        const addressEntity = this.addressRepository.createEntity(
          { address: request.address },
          uId,
        );
        await queryRunner.manager.save(addressEntity);
      }

      const orderDetailEntities = request.items.map((item) =>
        this.orderDetailRepository.createEntity(
          item.itemId,
          order.id,
          item.quantity,
          itemMap.get(item.itemId).salePrice || itemMap.get(item.itemId).price,
        ),
      );

      await queryRunner.manager.save(orderDetailEntities);
      await queryRunner.manager.save(items);

      await queryRunner.commitTransaction();
      return new ResponseBuilder()
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
}
