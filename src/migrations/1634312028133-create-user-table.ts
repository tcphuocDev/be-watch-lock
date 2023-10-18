import { UserStatusEnum } from '@components/user/user.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createUserTable1634312028133 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'fullname',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'gender',
            type: 'int',
          },
          {
            name: 'is_active',
            type: 'int',
            default: UserStatusEnum.Active,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'int',
            default: 0,
          },
          {
            name: 'otp',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'otp_expired',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'otp_login',
            type: 'varchar',
            length: '6',
            isNullable: true,
          },
          {
            name: 'otp_login_expired',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'count_check_otp',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'count_otp',
            type: 'int',
            isNullable: true,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      new Table({
        name: 'users',
      }),
    );
  }
}
