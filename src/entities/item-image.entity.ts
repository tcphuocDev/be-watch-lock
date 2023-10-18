import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_images')
export class ItemImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemId: number;

  @Column()
  url: string;
}
