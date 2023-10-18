import { ListAddressQuery } from '@components/address/dto/query/list-address.query';
import { CreateAddressRequest } from '@components/address/dto/request/create-address.request';
import { AddressEntity } from '@entities/address.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(AddressEntity)
export class AddressRepository extends Repository<AddressEntity> {
  public createEntity(
    request: CreateAddressRequest,
    userId: number,
  ): AddressEntity {
    const newEntity = new AddressEntity();
    newEntity.address = request.address;
    newEntity.userId = userId;
    return newEntity;
  }

  public async list(
    request: ListAddressQuery,
    userId: number,
  ): Promise<[any[], number]> {
    const query = this.createQueryBuilder().where('user_id = :userId', {
      userId,
    });

    const data = await query
      // .skip(request.take)
      // .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }
}
