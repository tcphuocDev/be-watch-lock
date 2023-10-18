import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCouponRequest {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @IsNotEmpty()
  planQuantity: number;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  value: number;
}
