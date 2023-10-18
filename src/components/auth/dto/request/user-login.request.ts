import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserLoginRequest {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  otp: string;
}
