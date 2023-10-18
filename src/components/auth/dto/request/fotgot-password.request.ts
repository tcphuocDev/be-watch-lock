import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequest {
  @IsNotEmpty()
  @IsString()
  phone: string;
}
