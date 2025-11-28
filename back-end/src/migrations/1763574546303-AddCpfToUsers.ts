import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCpfToUsers1763574546303 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN cpf VARCHAR(14) UNIQUE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN cpf
        `);
    }

}
