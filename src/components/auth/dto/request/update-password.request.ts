import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordRequest {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
