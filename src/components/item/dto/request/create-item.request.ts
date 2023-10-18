import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class SpecificationDetail {
  @IsInt()
  @IsNotEmpty()
  specificationId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateItemRequest {
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  tag: string;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  branchId: number;

  @Min(0)
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  price: number;

  @Min(0)
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  salePrice: number;

  @Min(0)
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  stockQuantity: number;

  @Type(() => SpecificationDetail)
  @ArrayUnique<SpecificationDetail>((s) => s.specificationId)
  @ValidateNested({ each: true })
  @Transform(({ value }) => JSON.parse(value))
  @ArrayNotEmpty()
  specificationDetails: SpecificationDetail[];
}
