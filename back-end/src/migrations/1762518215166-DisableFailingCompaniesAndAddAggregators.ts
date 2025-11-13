import { MigrationInterface, QueryRunner } from "typeorm";

export class DisableFailingCompaniesAndAddAggregators1762518215166 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PASSO 1: Desabilitar TODAS as empresas Lever e Greenhouse company-specific
        // Motivo: Maioria retorna 404, melhor focar em agregadores
        await queryRunner.query(`
            UPDATE "job_boards"
            SET enabled = false
            WHERE slug IN (
                -- Empresas Lever (25 total)
                'yuno', 'connectly', 'clip', 'kavak', 'bitso', 'kushki',
                'binance', 'coinbase', 'kraken', 'gemini', 'circle', 'chainalysis',
                'stripe', 'netflix', 'uber', 'reddit', 'duolingo',
                'databricks', 'snowflake', 'mongodb', 'elastic', 'datadog', 'gitlab', 'notion', 'figma', 'canva',

                -- Empresas Greenhouse (16 total)
                'nubank-gh', 'gympass-gh', 'wildlife-gh', 'rappi-gh',
                'deel-gh', 'remote-gh', 'toptal-gh', 'zapier-gh', 'automattic-gh',
                'airbnb-gh', 'spotify-gh', 'shopify-gh', 'github-gh', 'slack-gh',
                'twilio-gh', 'zendesk-gh', 'atlassian-gh'
            )
        `);

        // PASSO 2: Desabilitar job board genérico "lever" (não é específico)
        await queryRunner.query(`
            UPDATE "job_boards"
            SET enabled = false
            WHERE slug = 'lever'
        `);

        // PASSO 3: Manter apenas agregadores funcionando
        // Wellfound, Built In, RemoteYeah já estão funcionando
        // Y Combinator está habilitado mas precisa de implementação
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reabilitar todas as empresas Lever e Greenhouse
        await queryRunner.query(`
            UPDATE "job_boards"
            SET enabled = true
            WHERE slug IN (
                'yuno', 'connectly', 'clip', 'kavak', 'bitso', 'kushki',
                'binance', 'coinbase', 'kraken', 'gemini', 'circle', 'chainalysis',
                'stripe', 'netflix', 'uber', 'reddit', 'duolingo',
                'databricks', 'snowflake', 'mongodb', 'elastic', 'datadog', 'gitlab', 'notion', 'figma', 'canva',
                'nubank-gh', 'gympass-gh', 'wildlife-gh', 'rappi-gh',
                'deel-gh', 'remote-gh', 'toptal-gh', 'zapier-gh', 'automattic-gh',
                'airbnb-gh', 'spotify-gh', 'shopify-gh', 'github-gh', 'slack-gh',
                'twilio-gh', 'zendesk-gh', 'atlassian-gh',
                'lever'
            )
        `);
    }

}
