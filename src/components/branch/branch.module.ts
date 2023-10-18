import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchRepository } from '@repositories/branch.repository';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';

@Module({
  imports: [TypeOrmModule.forFeature([BranchRepository])],
  controllers: [BranchController],
  providers: [BranchService],
})
export class BranchModule {}
