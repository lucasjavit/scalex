import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRealCompaniesWithCorrectUrls1762476755777 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, desabilitar os job boards genéricos que não funcionam
        await queryRunner.query(`
            UPDATE "job_boards"
            SET enabled = false
            WHERE slug IN ('ashbyhq', 'leverjobs', 'workable', 'remoterocketship')
        `);

        // Adicionar empresas reais do LEVER com URLs corretas
        // Empresas LATAM Nativas & Crypto que usam Lever
        await queryRunner.query(`
            INSERT INTO "job_boards" ("slug", "name", "url", "scraper", "enabled", "priority", "description") VALUES
            -- LATAM Nativas (Lever)
            ('yuno', 'Yuno', 'https://jobs.lever.co/yuno', 'generic', true, 1, 'Payments orchestration LATAM'),
            ('connectly', 'Connectly', 'https://jobs.lever.co/connectly', 'generic', true, 1, 'Customer messaging Brasil/LATAM'),
            ('clip', 'Clip', 'https://jobs.lever.co/payclip', 'generic', true, 1, 'Payments México'),
            ('kavak', 'Kavak', 'https://jobs.lever.co/kavak', 'generic', true, 1, 'Used cars México/Brasil/Argentina'),
            ('bitso', 'Bitso', 'https://jobs.lever.co/bitso', 'generic', true, 1, 'Crypto exchange LATAM'),
            ('kushki', 'Kushki', 'https://jobs.lever.co/kushki', 'generic', true, 1, 'Payments infrastructure LATAM'),

            -- Crypto/Web3 (Lever)
            ('binance', 'Binance', 'https://jobs.lever.co/binance', 'generic', true, 1, 'Largest crypto exchange'),
            ('coinbase', 'Coinbase', 'https://jobs.lever.co/coinbase', 'generic', true, 1, 'Cryptocurrency exchange'),
            ('kraken', 'Kraken', 'https://jobs.lever.co/kraken', 'generic', true, 1, 'Crypto exchange'),
            ('gemini', 'Gemini', 'https://jobs.lever.co/gemini', 'generic', true, 1, 'Crypto platform'),
            ('circle', 'Circle', 'https://jobs.lever.co/circle', 'generic', true, 1, 'USDC stablecoin'),
            ('chainalysis', 'Chainalysis', 'https://jobs.lever.co/chainalysis', 'generic', true, 1, 'Blockchain analytics'),

            -- Tech Giants (Lever)
            ('stripe', 'Stripe', 'https://jobs.lever.co/stripe', 'generic', true, 1, 'Payment infrastructure'),
            ('netflix', 'Netflix', 'https://jobs.lever.co/netflix', 'generic', true, 1, 'Entertainment streaming'),
            ('uber', 'Uber', 'https://jobs.lever.co/uber', 'generic', true, 1, 'Ride-sharing'),
            ('reddit', 'Reddit', 'https://jobs.lever.co/reddit', 'generic', true, 1, 'Social network'),
            ('duolingo', 'Duolingo', 'https://jobs.lever.co/duolingo', 'generic', true, 1, 'Language learning'),

            -- SaaS/B2B (Lever)
            ('databricks', 'Databricks', 'https://jobs.lever.co/databricks', 'generic', true, 1, 'Data & AI platform'),
            ('snowflake', 'Snowflake', 'https://jobs.lever.co/snowflake', 'generic', true, 1, 'Data cloud'),
            ('mongodb', 'MongoDB', 'https://jobs.lever.co/mongodb', 'generic', true, 1, 'NoSQL database'),
            ('elastic', 'Elastic', 'https://jobs.lever.co/elastic', 'generic', true, 1, 'Search & analytics'),
            ('datadog', 'Datadog', 'https://jobs.lever.co/datadog', 'generic', true, 1, 'Observability'),
            ('gitlab', 'GitLab', 'https://jobs.lever.co/gitlab', 'generic', true, 1, 'DevOps platform'),
            ('notion', 'Notion', 'https://jobs.lever.co/notion', 'generic', true, 1, 'All-in-one workspace'),
            ('figma', 'Figma', 'https://jobs.lever.co/figma', 'generic', true, 1, 'Design collaboration'),
            ('canva', 'Canva', 'https://jobs.lever.co/canva', 'generic', true, 1, 'Graphic design')
            ON CONFLICT (slug) DO NOTHING
        `);

        // Adicionar empresas do GREENHOUSE com URLs corretas
        await queryRunner.query(`
            INSERT INTO "job_boards" ("slug", "name", "url", "scraper", "enabled", "priority", "description") VALUES
            -- LATAM Nativas (Greenhouse)
            ('nubank-gh', 'Nubank', 'https://boards.greenhouse.io/nubank', 'generic', true, 1, 'Banco digital Brasil/México/Colômbia'),
            ('gympass-gh', 'Gympass', 'https://boards.greenhouse.io/gympass', 'generic', true, 1, 'Corporate wellness LATAM'),
            ('wildlife-gh', 'Wildlife Studios', 'https://boards.greenhouse.io/wildlifestudios', 'generic', true, 1, 'Mobile gaming Brasil'),
            ('rappi-gh', 'Rappi', 'https://boards.greenhouse.io/rappi', 'generic', true, 1, 'Super app Colômbia/México/Brasil'),

            -- Remote-First (Greenhouse)
            ('deel-gh', 'Deel', 'https://boards.greenhouse.io/deel', 'generic', true, 1, 'Global HR & payroll'),
            ('remote-gh', 'Remote.com', 'https://boards.greenhouse.io/remotecom', 'generic', true, 1, 'Global payroll platform'),
            ('toptal-gh', 'Toptal', 'https://boards.greenhouse.io/toptal', 'generic', true, 1, 'Freelance talent network'),
            ('zapier-gh', 'Zapier', 'https://boards.greenhouse.io/zapier', 'generic', true, 1, 'Automation platform'),
            ('automattic-gh', 'Automattic', 'https://boards.greenhouse.io/automattic', 'generic', true, 1, 'WordPress/WooCommerce'),

            -- Tech Giants (Greenhouse)
            ('airbnb-gh', 'Airbnb', 'https://boards.greenhouse.io/airbnb', 'generic', true, 1, 'Travel & hospitality'),
            ('spotify-gh', 'Spotify', 'https://boards.greenhouse.io/spotify', 'generic', true, 1, 'Music streaming'),
            ('shopify-gh', 'Shopify', 'https://boards.greenhouse.io/shopify', 'generic', true, 1, 'E-commerce platform'),
            ('github-gh', 'GitHub', 'https://boards.greenhouse.io/github', 'generic', true, 1, 'Developer platform'),
            ('slack-gh', 'Slack', 'https://boards.greenhouse.io/slack', 'generic', true, 1, 'Team communication'),
            ('twilio-gh', 'Twilio', 'https://boards.greenhouse.io/twilio', 'generic', true, 1, 'Communications API'),
            ('zendesk-gh', 'Zendesk', 'https://boards.greenhouse.io/zendesk', 'generic', true, 1, 'Customer service'),
            ('atlassian-gh', 'Atlassian', 'https://boards.greenhouse.io/atlassian', 'generic', true, 1, 'Jira/Confluence')
            ON CONFLICT (slug) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover todas as empresas adicionadas
        await queryRunner.query(`
            DELETE FROM "job_boards"
            WHERE slug IN (
                'yuno', 'connectly', 'clip', 'kavak', 'bitso', 'kushki',
                'binance', 'coinbase', 'kraken', 'gemini', 'circle', 'chainalysis',
                'stripe', 'netflix', 'uber', 'reddit', 'duolingo',
                'databricks', 'snowflake', 'mongodb', 'elastic', 'datadog', 'gitlab', 'notion', 'figma', 'canva',
                'nubank-gh', 'gympass-gh', 'wildlife-gh', 'rappi-gh',
                'deel-gh', 'remote-gh', 'toptal-gh', 'zapier-gh', 'automattic-gh',
                'airbnb-gh', 'spotify-gh', 'shopify-gh', 'github-gh', 'slack-gh', 'twilio-gh', 'zendesk-gh', 'atlassian-gh'
            )
        `);

        // Reabilitar os job boards genéricos
        await queryRunner.query(`
            UPDATE "job_boards"
            SET enabled = true
            WHERE slug IN ('ashbyhq', 'leverjobs', 'workable', 'remoterocketship')
        `);
    }

}
