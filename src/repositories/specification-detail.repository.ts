import { EntityRepository, Repository } from 'typeorm';
import { SpecificationDetailEntity } from '@entities/specification-detail.entity';

@EntityRepository(SpecificationDetailEntity)
export class SpecificationDetailRepository extends Repository<SpecificationDetailEntity> {
  public createEntity(
    specificationId: number,
    itemId: number,
    content: string,
  ): SpecificationDetailEntity {
    const entity = new SpecificationDetailEntity();
    entity.specificationId = specificationId;
    entity.itemId = itemId;
    entity.content = content;
    return entity;
  }
}
