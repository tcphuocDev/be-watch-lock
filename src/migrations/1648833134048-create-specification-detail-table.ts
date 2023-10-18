import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class createSpecificationDetailTable1648833134048
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'specification_details',
        columns: [
          {
            name: 'item_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'specification_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'content',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'specification_details',
      new TableForeignKey({
        columnNames: ['item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'items',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'specification_details',
      new TableForeignKey({
        columnNames: ['specification_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'specifications',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('specification_details');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('item_id') !== -1,
    );
    const foreignKey2 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('specification_id') !== -1,
    );

    await queryRunner.dropForeignKey('specification_details', foreignKey);
    await queryRunner.dropForeignKey('specification_details', foreignKey2);

    await queryRunner.dropTable('specification_details');
  }
}
