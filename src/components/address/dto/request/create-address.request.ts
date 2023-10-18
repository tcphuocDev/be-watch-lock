import { AddressIsMainEnum } from '@components/address/address.constant';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressRequest {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(AddressIsMainEnum)
  @IsOptional()
  isMain?: AddressIsMainEnum;
}
