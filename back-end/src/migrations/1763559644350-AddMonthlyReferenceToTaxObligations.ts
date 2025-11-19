import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMonthlyReferenceToTaxObligations1763559644350 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the old reference_month VARCHAR column if it exists
        const table = await queryRunner.getTable('tax_obligations');
        const oldReferenceMonth = table?.findColumnByName('reference_month');
        if (oldReferenceMonth && oldReferenceMonth.type === 'character varying') {
            await queryRunner.dropColumn('tax_obligations', 'reference_month');
        }

        // Add reference_month column as INTEGER (1-12)
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'reference_month',
            type: 'integer',
            isNullable: false,
            default: 1,
        }));

        // Add reference_year column (YYYY format)
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'reference_year',
            type: 'integer',
            isNullable: false,
            default: new Date().getFullYear(),
        }));

        // Add file_name column
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
        }));

        // Add file_path column
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
        }));

        // Add file_size column (in bytes)
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'file_size',
            type: 'integer',
            isNullable: true,
        }));

        // Add mime_type column
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
        }));

        // Add CHECK constraint for reference_month (1-12)
        await queryRunner.query(`
            ALTER TABLE tax_obligations
            ADD CONSTRAINT chk_tax_obligations_reference_month
            CHECK (reference_month >= 1 AND reference_month <= 12)
        `);

        // Add CHECK constraint for reference_year (reasonable range)
        await queryRunner.query(`
            ALTER TABLE tax_obligations
            ADD CONSTRAINT chk_tax_obligations_reference_year
            CHECK (reference_year >= 2000 AND reference_year <= 2100)
        `);

        // Create composite index for company_id + reference_year + reference_month
        // This helps with searching taxes by company and period
        await queryRunner.query(`
            CREATE INDEX idx_tax_obligations_company_period
            ON tax_obligations(company_id, reference_year DESC, reference_month DESC)
        `);

        // Create index for reference_year + reference_month
        await queryRunner.query(`
            CREATE INDEX idx_tax_obligations_period
            ON tax_obligations(reference_year DESC, reference_month DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tax_obligations_period`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tax_obligations_company_period`);

        // Drop constraints
        await queryRunner.query(`ALTER TABLE tax_obligations DROP CONSTRAINT IF EXISTS chk_tax_obligations_reference_year`);
        await queryRunner.query(`ALTER TABLE tax_obligations DROP CONSTRAINT IF EXISTS chk_tax_obligations_reference_month`);

        // Drop file columns
        await queryRunner.dropColumn('tax_obligations', 'mime_type');
        await queryRunner.dropColumn('tax_obligations', 'file_size');
        await queryRunner.dropColumn('tax_obligations', 'file_path');
        await queryRunner.dropColumn('tax_obligations', 'file_name');

        // Drop new integer columns
        await queryRunner.dropColumn('tax_obligations', 'reference_year');
        await queryRunner.dropColumn('tax_obligations', 'reference_month');

        // Restore the old VARCHAR reference_month column
        await queryRunner.addColumn('tax_obligations', new TableColumn({
            name: 'reference_month',
            type: 'varchar',
            length: '7',
            isNullable: false,
            comment: 'Format: YYYY-MM',
        }));
    }

}
