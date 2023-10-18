import { PaginationQuery } from '@utils/pagination.query';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ListItemQuery extends PaginationQuery {
  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  categoryId: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  branchId: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  isSame: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  color: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  minPrice: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  maxPrice: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  orderPrice: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  orderView: number;

  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  orderStock: number;
}
