import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
