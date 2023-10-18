import { IsOptional } from 'class-validator';
import { CreateItemRequest } from './create-item.request';

export class UpdateItemRequest extends CreateItemRequest {
  @IsOptional()
  keepImages: string[];
}
