import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GenderEnum } from '@enums/gender.enum';

export class UserRegisterRequest {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsEnum(GenderEnum)
  gender: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}
