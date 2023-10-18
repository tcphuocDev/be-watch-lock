import { BranchEntity } from '@entities/branch.entity';
import { CategoryEntity } from '@entities/category.entity';
import { ItemImageEntity } from '@entities/item-image.entity';
import { SpecificationDetailEntity } from '@entities/specification-detail.entity';
import { SpecificationEntity } from '@entities/specification.entity';
import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { BranchRepository } from '@repositories/branch.repository';
import { CategoryRepository } from '@repositories/category.repository';
import { ItemImageRepository } from '@repositories/item-image.repository';
import { ItemRepository } from '@repositories/item.repository';
import { SpecificationDetailRepository } from '@repositories/specification-detail.repository';
import { SpecificationRepository } from '@repositories/specification.repository';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemRepository,
      CategoryRepository,
      ItemImageRepository,
      BranchRepository,
      SpecificationRepository,
      SpecificationDetailRepository,
    ]),
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    {
      provide: getRepositoryToken(ItemImageEntity),
      useClass: ItemImageRepository,
    },
    {
      provide: getRepositoryToken(CategoryEntity),
      useClass: CategoryRepository,
    },
    {
      provide: getRepositoryToken(BranchEntity),
      useClass: BranchRepository,
    },
    {
      provide: getRepositoryToken(SpecificationEntity),
      useClass: SpecificationRepository,
    },
    {
      provide: getRepositoryToken(SpecificationDetailEntity),
      useClass: SpecificationDetailRepository,
    },
  ],
})
export class ItemModule {}
