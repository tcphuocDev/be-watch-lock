import { EntityRepository, Repository } from 'typeorm';
import { ReviewEntity } from '@entities/review.entity';

@EntityRepository(ReviewEntity)
export class ReviewRepository extends Repository<ReviewEntity> {
  public createEntity(
    itemId: number,
    orderId: number,
    rate: number,
    userId: number,
    content: string,
  ): ReviewEntity {
    const newEntity = new ReviewEntity();
    newEntity.userId = userId;
    newEntity.itemId = itemId;
    newEntity.orderId = orderId;
    newEntity.rate = rate;
    newEntity.content = content;
    return newEntity;
  }
}
