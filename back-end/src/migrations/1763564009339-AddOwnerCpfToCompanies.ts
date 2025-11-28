import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnerCpfToCompanies1763564009339 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE accounting_companies
            ADD COLUMN owner_cpf VARCHAR(14) NOT NULL DEFAULT '00000000000'
        `);

        // Remove default after adding column (for future inserts to require explicit value)
        await queryRunner.query(`
            ALTER TABLE accounting_companies
            ALTER COLUMN owner_cpf DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE accounting_companies
            DROP COLUMN owner_cpf
        `);
    }

}
