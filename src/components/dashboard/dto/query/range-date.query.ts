import { IsDateString, IsNotEmpty } from 'class-validator';

export class RangeDateQuery {
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
