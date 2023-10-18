import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class createItemImageTable1648833134047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'item_images',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'item_id',
            type: 'int',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '255',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'item_images',
      new TableForeignKey({
        columnNames: ['item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'items',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('item_images');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('item_id') !== -1,
    );
    await queryRunner.dropForeignKey('item_images', foreignKey);

    await queryRunner.dropTable('item_images');
  }
}
