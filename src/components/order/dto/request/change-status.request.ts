import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ChangeStatusRequest {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  status: number;
}
