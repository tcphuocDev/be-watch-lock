import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';

class OrderDetailRequest {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  itemId: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderRequest {
  @Type(() => OrderDetailRequest)
  @ValidateNested({
    each: true,
  })
  @ArrayUnique<OrderDetailRequest>((item) => item.itemId)
  @ArrayNotEmpty()
  items: OrderDetailRequest[];
}
