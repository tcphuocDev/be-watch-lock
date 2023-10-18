import { Expose } from 'class-transformer';

export class LocationResponse {
  @Expose()
  id: number;

  @Expose()
  address: string;

  @Expose()
  isMain: number;
}
