import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class DetailQuery {
  @IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  isView: number;
}
