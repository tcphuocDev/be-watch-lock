import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { convertToSlug } from '@utils/common';

@Entity('items')
export class ItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @Column()
  branchId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  tag: string;

  @Column()
  slug: string;

  @Column()
  view: number;

  @Column()
  stockQuantity: number;

  @Column()
  price: number;

  @Column()
  salePrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  deletedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  convertToSlug() {
    this.slug = convertToSlug(this.name);
  }
}
