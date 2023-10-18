import { Expose, Type } from 'class-transformer';

class UserOrder {
  @Expose()
  id: number;

  @Expose()
  fullname: string;
}

class CouponOrder {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  value: number;
}

class OrderDetail {
  @Expose()
  itemId: number;

  @Expose()
  itemName: string;

  @Expose()
  itemRuleId: number;

  @Expose()
  price: number;

  @Expose()
  orderPrice: number;

  @Expose()
  salePrice: number;

  @Expose()
  quantity: number;

  @Expose()
  images: any;
}

export class DetailOrderResoponse {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserOrder)
  user: UserOrder;

  @Expose()
  @Type(() => CouponOrder)
  coupon: CouponOrder;

  @Expose()
  status: number;

  @Expose()
  address: string;

  @Expose()
  note: string;

  @Expose()
  phone: string;

  @Expose()
  @Type(() => OrderDetail)
  orderDetails: OrderDetail[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
