import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBranchRequest {
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
