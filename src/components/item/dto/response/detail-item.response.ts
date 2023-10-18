import { Expose } from 'class-transformer';
import { ListItemResponse } from './list-item.response';

export class DetailItemResponse extends ListItemResponse {
  @Expose()
  reviews: any;
}
