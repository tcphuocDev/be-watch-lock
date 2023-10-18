import { ListItemQuery } from '@components/item/dto/query/list-item.query';
import { CreateItemRequest } from '@components/item/dto/request/create-item.request';
import { DetailItemResponse } from '@components/item/dto/response/detail-item.response';
import { BranchEntity } from '@entities/branch.entity';
import { CategoryEntity } from '@entities/category.entity';
import { ItemImageEntity } from '@entities/item-image.entity';
import { ItemEntity } from '@entities/item.entity';
import { ReviewEntity } from '@entities/review.entity';
import { SpecificationDetailEntity } from '@entities/specification-detail.entity';
import { SpecificationEntity } from '@entities/specification.entity';
import { UserEntity } from '@entities/user.entity';
import { escapeCharForSearch } from '@utils/common';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ItemEntity)
export class ItemRepository extends Repository<ItemEntity> {
  createEntity(request: CreateItemRequest): ItemEntity {
    const newEntity = new ItemEntity();
    newEntity.name = request.name;
    newEntity.categoryId = request.categoryId;
    newEntity.branchId = request.branchId;
    newEntity.description = request.description;
    newEntity.tag = request.tag;
    newEntity.price = request.price;
    newEntity.salePrice = request.salePrice;
    newEntity.stockQuantity = request.stockQuantity;
    return newEntity;
  }

  public detail(id: number): Promise<DetailItemResponse> {
    return this.createQueryBuilder('i')
      .select([
        'i.id AS id',
        'i.name AS name',
        'i.description AS description',
        'i.view AS view',
        'i.tag AS tag',
        'i.slug AS slug',
        'i.price AS price',
        'i.sale_price AS "salePrice"',
        'i.stock_quantity AS "stockQuantity"',
        'i.created_at AS "createdAt"',
        'i.updated_at AS "updatedAt"',
        `JSON_BUILD_OBJECT('id', c.id, 'name', c.name) AS category`,
        `JSON_BUILD_OBJECT('id', b.id, 'name', b.name) AS branch`,
        `CASE WHEN COUNT(qb1) = 0 THEN '[]' ELSE JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'specificationId', qb1.specification_id, 'itemId', qb1.item_id,
          'name', qb1.name, 'content', qb1.content
        )) END AS specifications`,
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'id', qb2.id, 'url', qb2.url
        )) AS "itemImages"`,
        `CASE WHEN COUNT(qb4) = 0 THEN '[]' ELSE JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'rate', qb4.rate, 'content', qb4.content,
          'createdAt', qb4.created_at, 'fullname', qb4.fullname
        )) END AS "reviews"`,
      ])
      .leftJoin(
        (qb) =>
          qb
            .select([
              'sd.item_id AS item_id',
              'sd.specification_id AS specification_id',
              'sd.content AS content',
              's.name AS name',
            ])
            .from(SpecificationDetailEntity, 'sd')
            .innerJoin(SpecificationEntity, 's', 's.id = sd.specification_id')
            .where('sd.item_id = :id', { id }),
        'qb1',
        'qb1.item_id = i.id',
      )
      .leftJoin(
        (qb) =>
          qb
            .select(['ii.id AS id', 'ii.item_id AS item_id', 'ii.url AS url'])
            .from(ItemImageEntity, 'ii')
            .where('ii.item_id = :id', { id }),
        'qb2',
        'qb2.item_id = i.id',
      )
      .leftJoin(
        (qb) =>
          qb
            .select([
              'r.item_id AS item_id',
              'r.rate AS rate',
              'r.content AS content',
              'r.created_at AS created_at',
              'u.fullname AS fullname',
            ])
            .from(ReviewEntity, 'r')
            .leftJoin(UserEntity, 'u', 'u.id = r.user_id')
            .where('r.item_id = :id', { id }),
        'qb4',
        'qb4.item_id = i.id',
      )
      .innerJoin(CategoryEntity, 'c', 'c.id = i.category_id')
      .innerJoin(BranchEntity, 'b', 'b.id = i.branch_id')
      .where('i.id = :id', { id })
      .groupBy('i.id')
      .addGroupBy('c.id')
      .addGroupBy('b.id')
      .getRawOne();
  }

  public async list(request: ListItemQuery): Promise<[any[], number]> {
    const query = this.createQueryBuilder('i')
      .select([
        'i.id AS id',
        'i.name AS name',
        'i.description AS description',
        'i.view AS view',
        'i.tag AS tag',
        'i.slug AS slug',
        'i.price AS price',
        'i.sale_price AS "salePrice"',
        'i.stock_quantity AS "stockQuantity"',
        'i.created_at AS "createdAt"',
        'i.updated_at AS "updatedAt"',
        `JSON_BUILD_OBJECT('id', c.id, 'name', c.name) AS category`,
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'id', qb2.id, 'url', qb2.url
        )) AS "itemImages"`,
      ])
      .leftJoin(
        (qb) =>
          qb
            .select(['ii.id AS id', 'ii.item_id AS item_id', 'ii.url AS url'])
            .from(ItemImageEntity, 'ii'),
        'qb2',
        'qb2.item_id = i.id',
      )
      .innerJoin(CategoryEntity, 'c', 'c.id = i.category_id')
      .groupBy('i.id')
      .addGroupBy('c.id');

    if (request.keyword) {
      query.where(`UNACCENT(i.name) ILIKE UNACCENT(:keyword) escape '\\'`, {
        keyword: `%${escapeCharForSearch(request.keyword)}%`,
      });
    }

    if (request.isSame) {
      query.andWhere('i.id <> :isSame', {
        isSame: request.isSame,
      });
    }

    if (request.categoryId) {
      query.andWhere('i.category_id = :categoryId', {
        categoryId: request.categoryId,
      });
    }

    if (request.branchId) {
      query.andWhere('i.branch_id = :branchId', {
        branchId: request.branchId,
      });
    }

    if (request.minPrice) {
      query.andWhere('i.sale_price >= :minPrice', {
        minPrice: request.minPrice,
      });
    }

    if (request.maxPrice) {
      query.andWhere('i.sale_price <= :maxPrice', {
        maxPrice: request.maxPrice,
      });
    }

    if (request.orderPrice) {
      query.orderBy('i.sale_price', request.orderPrice === 1 ? 'ASC' : 'DESC');
    } else if (request.orderView) {
      query.orderBy('i.view', request.orderView === 1 ? 'ASC' : 'DESC');
    } else if (request.orderStock) {
      query.orderBy(
        'i.stock_quantity',
        request.orderStock === 1 ? 'ASC' : 'DESC',
      );
    } else {
      query.orderBy('i.created_at', 'DESC');
    }

    const data = await query
      .limit(request.take)
      .offset(request.skip)
      .getRawMany();
    const count = await query.getCount();
    return [data, count];
  }

  public updateView(id: number): Promise<any> {
    return this.createQueryBuilder()
      .where('id = :id', { id })
      .update()
      .set({
        view: () => 'view + 1',
      })
      .execute();
  }

  public async coutStock(): Promise<any> {
    return this.createQueryBuilder('i')
      .select(['SUM(i.stock_quantity) AS quantity'])
      .getRawOne();
  }
}
