import { ItemImageEntity } from '@entities/item-image.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ItemImageEntity)
export class ItemImageRepository extends Repository<ItemImageEntity> {
  public createEntity(itemId: number, url: string): ItemImageEntity {
    const entity = new ItemImageEntity();
    entity.itemId = itemId;
    entity.url = url;
    return entity;
  }
}
