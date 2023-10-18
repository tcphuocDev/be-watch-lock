import { EntityRepository, Repository } from 'typeorm';
import { SpecificationEntity } from '@entities/specification.entity';
import { CreateSpecificationRequest } from '@components/specification/dto/request/create-specification.request';
import { ListSpecificationQuery } from '@components/specification/dto/query/list-specification.query';

@EntityRepository(SpecificationEntity)
export class SpecificationRepository extends Repository<SpecificationEntity> {
  public createEntity(
    request: CreateSpecificationRequest,
  ): SpecificationEntity {
    const newEntity = new SpecificationEntity();
    newEntity.name = request.name;
    return newEntity;
  }

  public async list(request: ListSpecificationQuery): Promise<[any[], number]> {
    const query = this.createQueryBuilder('s').select([
      's.id AS id',
      's.name AS name',
    ]);

    const data = await query
      .orderBy('s.id', 'DESC')
      .limit(request.take)
      .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }
}
