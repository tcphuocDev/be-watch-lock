import { Expose } from 'class-transformer';

export class SpecificationResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
