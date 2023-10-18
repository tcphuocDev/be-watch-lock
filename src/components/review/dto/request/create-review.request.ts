import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewRequest {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Min(1)
  @Max(5)
  @IsNumber()
  @IsNotEmpty()
  rate: number;
}
