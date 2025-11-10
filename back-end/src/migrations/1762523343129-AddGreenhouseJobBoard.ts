import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGreenhouseJobBoard1762523343129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona Greenhouse como job board agregador
    // Usa scraper "greenhouse" que irá iterar sobre múltiplas empresas
    await queryRunner.query(`
      INSERT INTO job_boards (
        slug,
        name,
        url,
        scraper,
        enabled,
        priority,
        description,
        metadata
      ) VALUES (
        'greenhouse',
        'Greenhouse (Multi-Company)',
        'https://boards-api.greenhouse.io/v1/boards',
        'greenhouse',
        true,
        2,
        'Aggregator que busca vagas de múltiplas empresas que usam Greenhouse ATS. Inclui empresas como HubSpot, Duolingo, GitLab, Shopify e outras.',
        '{"type": "multi_company", "company_count": 70, "strategy": "api_multi_company"}'
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url,
        scraper = EXCLUDED.scraper,
        enabled = EXCLUDED.enabled,
        priority = EXCLUDED.priority,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata;
    `);

    // Fix para o user_card_progress que foi gerado automaticamente
    await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT '2.5'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM job_boards WHERE slug = 'greenhouse';
    `);

    await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT 2.5`);
  }
}
