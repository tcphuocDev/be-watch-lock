import { DetailRequest } from '@utils/detail.request';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CheckoutOrderRequest extends DetailRequest {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  couponId: number;
}
