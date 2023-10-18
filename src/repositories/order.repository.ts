import { ListOrderQuery } from '@components/order/dto/query/list-order.query';
import { DetailOrderResoponse } from '@components/order/dto/response/detail-order.response';
import { IsMe, OrderStatusEnum } from '@components/order/order.constant';
import { CouponEntity } from '@entities/coupon.entity';
import { ItemImageEntity } from '@entities/item-image.entity';
import { ItemEntity } from '@entities/item.entity';
import { OrderDetailEntity } from '@entities/order-detail.entity';
import { OrderEntity } from '@entities/order.entity';
import { UserEntity } from '@entities/user.entity';
import { DetailRequest } from '@utils/detail.request';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {
  createEntity(
    userId: number,
    phone?: string,
    address?: string,
    status?: number,
    note?: string,
    couponId?: number,
  ): OrderEntity {
    const newEntity = new OrderEntity();
    newEntity.userId = userId;
    newEntity.phone = phone;
    newEntity.address = address;
    newEntity.note = note;
    newEntity.couponId = couponId;
    newEntity.status = status ? status : OrderStatusEnum.INCART;
    return newEntity;
  }

  detail(request: DetailRequest): Promise<DetailOrderResoponse> {
    return this.createQueryBuilder('o')
      .select([
        'o.id AS id',
        'o.status AS status',
        'o.address AS address',
        'o.phone AS phone',
        'o.note AS note',
        'o.created_at AS "createdAt"',
        'o.updated_at AS "updatedAt"',
        `JSON_BUILD_OBJECT('id', c.id, 'code', c.code, 'value', c.value) AS coupon`,
        `JSON_BUILD_OBJECT('id', u.id, 'fullname', u.fullname) AS user`,
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'itemId', qb.item_id, 'itemName', qb.item_name,
          'price', qb.price, 'orderPrice', qb.order_price, 
          'salePrice', qb.sale_price, 'quantity', qb.quantity, 
          'images', qb.images
        )) AS "orderDetails"`,
      ])
      .innerJoin(UserEntity, 'u', 'u.id = o.user_id')
      .leftJoin(CouponEntity, 'c', 'c.id = o.coupon_id')
      .innerJoin(
        (qb) =>
          qb
            .select([
              'od.quantity AS quantity',
              'i.name AS item_name',
              'i.id AS item_id',
              'od.price AS order_price',
              'i.sale_price AS sale_price',
              'i.price AS price',
              'od.order_id AS order_id',
              `JSON_AGG(JSON_BUILD_OBJECT('url', qb.url)) AS images`,
            ])
            .from(OrderDetailEntity, 'od')
            .innerJoin(ItemEntity, 'i', 'i.id = od.item_id')
            .leftJoin(
              (qb) =>
                qb
                  .from(ItemImageEntity, 'ii')
                  .select(['ii.item_id AS item_id', 'ii.url AS url']),
              'qb',
              'qb.item_id = i.id',
            )
            .where('od.order_id = :id', { id: request.id })
            .groupBy('od.quantity')
            .addGroupBy('i.name')
            .addGroupBy('i.id')
            .addGroupBy('od.price')
            .addGroupBy('od.order_id'),
        'qb',
        'qb.order_id = o.id',
      )
      .where('o.id = :id', { id: request.id })
      .groupBy('o.id')
      .addGroupBy('c.id')
      .addGroupBy('u.id')
      .getRawOne();
  }

  async list(
    request: ListOrderQuery,
    userId: number,
  ): Promise<[any[], number]> {
    const query = this.createQueryBuilder('o')
      .select([
        'o.id AS id',
        'o.status AS status',
        'o.address AS address',
        'o.phone AS phone',
        'o.note AS note',
        'o.created_at AS "createdAt"',
        'o.updated_at AS "updatedAt"',
        `JSON_BUILD_OBJECT('id', c.id, 'code', c.code, 'value', c.value) AS coupon`,
        `JSON_BUILD_OBJECT('id', u.id, 'fullname', u.fullname) AS user`,
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'itemId', qb.item_id, 'itemName', qb.item_name,
          'price', qb.price, 'orderPrice', qb.order_price, 
          'salePrice', qb.sale_price, 'quantity', qb.quantity
        )) AS "orderDetails"`,
      ])
      .innerJoin(UserEntity, 'u', 'u.id = o.user_id')
      .leftJoin(CouponEntity, 'c', 'c.id = o.coupon_id')
      .innerJoin(
        (qb) =>
          qb
            .select([
              'od.quantity AS quantity',
              'i.name AS item_name',
              'i.id AS item_id',
              'od.price AS order_price',
              'i.sale_price AS sale_price',
              'i.price AS price',
              'od.order_id AS order_id',
            ])
            .from(OrderDetailEntity, 'od')
            .innerJoin(ItemEntity, 'i', 'i.id = od.item_id'),
        'qb',
        'qb.order_id = o.id',
      )
      .where('o.status <> :status', { status: OrderStatusEnum.INCART })
      .groupBy('o.id')
      .addGroupBy('c.id')
      .addGroupBy('u.id');

    if (request.isMe === IsMe.Yes) {
      query.andWhere('o.user_id = :uid', { uid: userId });
    }

    const data = await query
      .orderBy('o.created_at', 'DESC')
      .limit(request.take)
      .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }

  async detailByUserAndItem(itemId: number, userId: number): Promise<any> {
    return this.createQueryBuilder('o')
      .select(['o.id AS id'])
      .innerJoin(OrderDetailEntity, 'od', 'o.id = od.order_id')
      .where('o.user_id = :userId', { userId })
      .andWhere('od.item_id = :itemId', { itemId })
      .getRawOne();
  }

  dashboardMoney(startDate: Date, endDate: Date): Promise<any> {
    return this.createQueryBuilder('o')
      .select([
        'o.id AS id',
        'o.status AS status',
        'o.updated_at AS "updatedAt"',
        '(1 - 1.0*COALESCE(c.value, 0)/100)*SUM(od.quantity * od.price) AS price',
      ])
      .leftJoin(CouponEntity, 'c', 'o.coupon_id = c.id')
      .innerJoin(OrderDetailEntity, 'od', 'od.order_id = o.id')
      .where('o.updated_at::date >= :start', { start: startDate })
      .andWhere('o.updated_at::date <= :end', { end: endDate })
      .andWhere('o.status = :status', { status: OrderStatusEnum.SUCCESS })
      .groupBy('o.id')
      .addGroupBy('c.value')
      .getRawMany();
  }
}
