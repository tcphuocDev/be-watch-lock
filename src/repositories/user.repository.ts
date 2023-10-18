import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '@entities/user.entity';
import { UserRegisterRequest } from '@components/auth/dto/request/user-register.request';
import { ListUserQuery } from '@components/user/dto/query/list-user.query';
import { OrderEntity } from '@entities/order.entity';
import { OrderDetailEntity } from '@entities/order-detail.entity';
import { OrderStatusEnum } from '@components/order/order.constant';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  public createEntity(request: UserRegisterRequest): UserEntity {
    const user = new UserEntity();
    user.phone = request.phone;
    user.email = request.email;
    user.fullname = request.fullname;
    user.gender = request.gender;
    user.password = request.password;
    return user;
  }

  public createEntityPublic(
    phone: string,
    fullname: string,
    gender: number,
    email: string,
  ): UserEntity {
    const newEntity = new UserEntity();
    newEntity.phone = phone;
    newEntity.fullname = fullname;
    newEntity.gender = gender;
    newEntity.email = email;
    return newEntity;
  }

  public async list(request: ListUserQuery): Promise<[any[], number]> {
    const query = this.createQueryBuilder('u').select([
      'u.id AS id',
      'u.phone AS phone',
      'u.email AS email',
      'u.fullname AS fullname',
      'u.gender AS gender',
      'u.role AS role',
      'u.is_active AS "isActive"',
      'u.created_at AS "createdAt"',
      'u.updated_at AS "updatedAt"',
    ]);

    const data = await query
      .orderBy('u.id', 'DESC')
      .limit(request.take)
      .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }

  public dashboardUser(): Promise<any> {
    return this.createQueryBuilder('u')
      .select([
        'u.id AS user_id',
        'u.fullname AS fullname',
        'u.phone AS phone',
        'SUM(qb.money) AS money',
      ])
      .innerJoin(
        (qb) => {
          return qb
            .select([
              'o.user_id AS user_id',
              'SUM(od.quantity * od.price) AS money',
            ])
            .from(OrderEntity, 'o')
            .innerJoin(OrderDetailEntity, 'od', 'od.order_id = o.id')
            .where('o.status = :status', { status: OrderStatusEnum.SUCCESS })
            .groupBy('o.user_id');
        },
        'qb',
        'qb.user_id = u.id',
      )
      .groupBy('u.id')
      .orderBy('SUM(qb.money)', 'DESC')
      .getRawMany();
  }
}
