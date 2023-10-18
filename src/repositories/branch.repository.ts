import { ListBranchQuery } from '@components/branch/dto/query/list-branch.query';
import { CreateBranchRequest } from '@components/branch/dto/request/create-branch.request';
import { BranchEntity } from '@entities/branch.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BranchEntity)
export class BranchRepository extends Repository<BranchEntity> {
  createEntity(request: CreateBranchRequest, files: any): BranchEntity {
    const newEntity = new BranchEntity();
    newEntity.name = request.name;
    newEntity.description = request.description;
    if (files?.length) {
      newEntity.logo = files[0]?.filename;
    }
    return newEntity;
  }

  public async list(request: ListBranchQuery): Promise<[any[], number]> {
    const query = this.createQueryBuilder('b').select([
      'b.name AS name',
      'b.slug AS slug',
      'b.description AS description',
      'b.logo AS logo',
      'b.id AS id',
      'b.created_at AS "createdAt"',
      'b.updated_at AS "updatedAt"',
    ]);

    const data = await query
      .orderBy('b.created_at', 'DESC')
      .offset(request.skip)
      .limit(request.take)
      .getRawMany();

    const count = await query.getCount();
    return [data, count];
  }
}
