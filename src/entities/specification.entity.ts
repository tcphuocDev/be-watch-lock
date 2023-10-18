import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specifications')
export class SpecificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
