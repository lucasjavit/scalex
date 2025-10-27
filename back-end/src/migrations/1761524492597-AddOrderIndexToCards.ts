import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOrderIndexToCards1761524492597 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add order_index column to cards table
        await queryRunner.addColumn('cards', new TableColumn({
            name: 'order_index',
            type: 'integer',
            default: 0,
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove order_index column from cards table
        await queryRunner.dropColumn('cards', 'order_index');
    }

}
