import { Expose, Type } from 'class-transformer';

export class BaseResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

class Category extends BaseResponse {}

class Branch extends BaseResponse {}

class ItemImage {
  @Expose()
  id: number;

  @Expose()
  url: string;
}

class Specification {
  @Expose()
  specificationId: number;

  @Expose()
  itemId: number;

  @Expose()
  name: string;

  @Expose()
  content: string;
}

class Review {
  @Expose()
  count: number;

  @Expose()
  rate: number;
}

export class ListItemResponse {
  @Expose()
  id: number;

  @Type(() => Category)
  @Expose()
  category: Category;

  @Type(() => Branch)
  @Expose()
  branch: Branch;

  @Type(() => Review)
  @Expose()
  review: Review;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  view: number;

  @Expose()
  price: number;

  @Expose()
  salePrice: number;

  @Expose()
  stockQuantity: number;

  @Expose()
  tag: string;

  @Expose()
  slug: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Type(() => Specification)
  @Expose()
  specifications: Specification[];

  @Type(() => ItemImage)
  @Expose()
  itemImages: ItemImage[];
}
