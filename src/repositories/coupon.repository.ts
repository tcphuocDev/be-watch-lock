import { EntityRepository, Repository } from 'typeorm';
import { CreateCouponRequest } from '@components/coupon/dto/request/create-coupon.request';
import { ListCouponQuery } from '@components/coupon/dto/query/list-coupon.query';
import { CouponEntity } from '@entities/coupon.entity';
import { CouponStatusEnum } from '@components/coupon/coupon.constant';
import { escapeCharForSearch } from '@utils/common';

@EntityRepository(CouponEntity)
export class CouponRepository extends Repository<CouponEntity> {
  public createEntity(request: CreateCouponRequest): CouponEntity {
    const newEntity = new CouponEntity();
    newEntity.code = request.code;
    newEntity.planQuantity = request.planQuantity;
    newEntity.actualQuantity = 0;
    newEntity.status = CouponStatusEnum.WaitingConfirm;
    newEntity.value = request.value;
    return newEntity;
  }

  public async list(request: ListCouponQuery): Promise<[any[], number]> {
    const query = this.createQueryBuilder('c').select([
      'c.id AS id',
      'c.code AS code',
      'c.plan_quantity AS "planQuantity"',
      'c.actual_quantity AS "actualQuantity"',
      'c.value AS value',
      'c.status AS status',
      'c.created_at AS "createdAt"',
      'c.updated_at AS "updatedAt"',
    ]);

    if (request.keyword) {
      query.where(`UNACCENT(c.code) ILIKE UNACCENT(:keyword) escape '\\'`, {
        keyword: `%${escapeCharForSearch(request.keyword)}%`,
      });
    }

    const data = await query
      .orderBy('c.created_at', 'DESC')
      .limit(request.take)
      .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }
}
