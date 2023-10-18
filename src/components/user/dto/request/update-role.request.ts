import { UserStatusEnum } from '@components/user/user.constant';
import { RoleEnum } from '@enums/role.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserRequest {
  @IsEnum(RoleEnum)
  @IsOptional()
  role: RoleEnum;

  @IsEnum(UserStatusEnum)
  @IsOptional()
  isActive: UserStatusEnum;
}
