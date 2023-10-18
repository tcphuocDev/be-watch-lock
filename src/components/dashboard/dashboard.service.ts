import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseBuilder } from '@utils/response-builder';
import { ResponsePayload } from '@utils/response-payload';
import { UserRepository } from '@repositories/user.repository';
import { UserStatusEnum } from '@components/user/user.constant';
import { OrderRepository } from '@repositories/order.repository';
import { OrderStatusEnum } from '@components/order/order.constant';
import * as moment from 'moment-timezone';
import { Between } from 'typeorm';
import { RangeDateQuery } from './dto/query/range-date.query';
import { ItemRepository } from '@repositories/item.repository';
moment.tz('Asia/Ho_Chi_Minh');

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,

    @InjectRepository(OrderRepository)
    private readonly orderRepository: OrderRepository,

    @InjectRepository(ItemRepository)
    private readonly itemRepository: ItemRepository,
  ) {}

  async list(): Promise<ResponsePayload<any>> {
    const [countUser, countOrder, stockQuantity] = await Promise.all([
      this.userRepository.count({
        isActive: UserStatusEnum.Active,
      }),
      this.orderRepository.count({
        status: OrderStatusEnum.SUCCESS,
      }),
      this.itemRepository.coutStock(),
    ]);

    return new ResponseBuilder({
      countUser,
      countOrder,
      stockQuantity: stockQuantity.quantity,
    })
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async customer(): Promise<ResponsePayload<any>> {
    const users = await this.userRepository.dashboardUser();

    return new ResponseBuilder({
      users,
    })
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }

  async dashboardMoney(request: RangeDateQuery): Promise<ResponsePayload<any>> {
    const data = await this.orderRepository.dashboardMoney(
      request.startDate,
      request.endDate,
    );

    const listRangeDate = [];
    const from = moment(request.startDate)
      .tz('Asia/Ho_Chi_Minh')
      .startOf('day');

    const to = moment(request.endDate).tz('Asia/Ho_Chi_Minh').endOf('day');

    for (
      let date = from.clone();
      date.isSameOrBefore(to, 'day');
      date = date.clone().add(1, 'day')
    ) {
      listRangeDate.push(date.clone().format('DD/MM/YYYY'));
    }
    const dataReturn = [];
    listRangeDate.forEach((e) => {
      const orders = data.filter(
        (order) =>
          moment(order.updatedAt)
            .tz('Asia/Ho_Chi_Minh')
            .format('DD/MM/YYYY') === e,
      );

      const count = {
        SUCCESS: 0,
        PENDING: 0,
      };

      orders.forEach((order) => {
        switch (order.status) {
          case OrderStatusEnum.SUCCESS:
            count.SUCCESS += Number(order.price);
            break;
          default:
            count.PENDING += Number(order.price);
            break;
        }
      });

      dataReturn.push({
        date: e,
        count,
      });
    });

    return new ResponseBuilder({ items: dataReturn })
      .withCode(ResponseCodeEnum.SUCCESS)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .build();
  }
}
