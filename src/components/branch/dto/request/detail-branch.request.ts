import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class DetailBranchRequest {
  @IsOptional()
  @Transform((value) => Number(value.value))
  @IsNumber()
  id: number;
}
