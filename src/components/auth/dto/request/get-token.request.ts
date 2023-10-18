import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokenRequest {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
