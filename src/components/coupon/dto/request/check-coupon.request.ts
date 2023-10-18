import { IsNotEmpty, IsString } from 'class-validator';

export class CheckCouponRequest {
  @IsString()
  @IsNotEmpty()
  code: string;
}
