import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpecificationRequest {
  @IsString()
  @IsNotEmpty()
  name: string;
}
