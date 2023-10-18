import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordRequest {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
