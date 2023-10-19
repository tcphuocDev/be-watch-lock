import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GenderEnum } from '@enums/gender.enum';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => +value)
  @IsEnum(GenderEnum)
  gender: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}
