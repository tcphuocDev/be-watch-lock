import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specification_details')
export class SpecificationDetailEntity {
  @PrimaryColumn()
  itemId: number;

  @PrimaryColumn()
  specificationId: number;

  @Column()
  content: string;
}
