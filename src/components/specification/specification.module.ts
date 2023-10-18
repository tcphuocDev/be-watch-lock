import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecificationRepository } from '@repositories/specification.repository';
import { SpecificationController } from './specification.controller';
import { SpecificationService } from './specification.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpecificationRepository])],
  controllers: [SpecificationController],
  providers: [SpecificationService],
})
export class SpecificationModule {}
