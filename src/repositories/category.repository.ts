import { CategoryEntity } from '@entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateCategoryRequest } from '@components/category/dto/request/create-category.request';
import { GetCategoriesQuery } from '@components/category/dto/query/get-categories.query';

@EntityRepository(CategoryEntity)
export class CategoryRepository extends Repository<CategoryEntity> {
  public createEntity(request: CreateCategoryRequest): CategoryEntity {
    const newCategoryEntity = new CategoryEntity();
    newCategoryEntity.name = request.name;
    newCategoryEntity.description = request.description;
    return newCategoryEntity;
  }

  public async getCategories(
    request: GetCategoriesQuery,
  ): Promise<[any[], number]> {
    const query = this.createQueryBuilder('c').select([
      'c.id AS id',
      'c.name AS name',
      'c.description AS description',
      'c.slug AS slug',
      'c.created_at AS "createdAt"',
      'c.updated_at AS "updatedAt"',
    ]);

    const data = await query
      .orderBy('c.created_at', 'DESC')
      .limit(request.take)
      .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }
}
