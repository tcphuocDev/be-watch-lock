import { IsNotEmpty, IsString } from 'class-validator';

export class SetupPasswordRequest {
  @IsString()
  @IsNotEmpty()
  password: string;
}
