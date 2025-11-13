import { MigrationInterface, QueryRunner } from "typeorm";

export class FixJobBoardsVsCompanies1763038154738 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting FixJobBoardsVsCompanies migration...');

        // 1. First, let's ensure the correct aggregator job boards exist
        // Check if Lever aggregator exists
        const [leverBoard] = await queryRunner.query(`
            SELECT id, slug FROM job_boards WHERE slug IN ('lever', 'leverjobs') ORDER BY enabled DESC LIMIT 1
        `);

        let finalLeverBoardId = leverBoard?.id;

        // If no Lever board exists or it's 'leverjobs', ensure 'lever' exists
        if (!leverBoard || leverBoard.slug === 'leverjobs') {
            await queryRunner.query(`
                INSERT INTO job_boards (slug, name, url, scraper, enabled, priority, description)
                VALUES ('lever', 'Lever Jobs', 'https://jobs.lever.co', 'lever', true, 1, 'Lever ATS - Multi-company job board')
                ON CONFLICT (slug) DO UPDATE SET
                    scraper = 'lever',
                    enabled = true,
                    priority = 1,
                    description = 'Lever ATS - Multi-company job board'
            `);

            const [newLever] = await queryRunner.query(`SELECT id FROM job_boards WHERE slug = 'lever'`);
            finalLeverBoardId = newLever?.id;
        }

        // Check if Greenhouse aggregator exists
        const [greenhouseBoard] = await queryRunner.query(`
            SELECT id FROM job_boards WHERE slug = 'greenhouse' LIMIT 1
        `);

        let finalGreenhouseBoardId = greenhouseBoard?.id;

        if (!greenhouseBoard) {
            await queryRunner.query(`
                INSERT INTO job_boards (slug, name, url, scraper, enabled, priority, description)
                VALUES ('greenhouse', 'Greenhouse', 'https://boards.greenhouse.io', 'greenhouse', true, 1, 'Greenhouse ATS - Multi-company job board')
                ON CONFLICT (slug) DO UPDATE SET
                    scraper = 'greenhouse',
                    enabled = true,
                    priority = 1,
                    description = 'Greenhouse ATS - Multi-company job board'
            `);

            const [newGreenhouse] = await queryRunner.query(`SELECT id FROM job_boards WHERE slug = 'greenhouse'`);
            finalGreenhouseBoardId = newGreenhouse?.id;
        }

        console.log(`✅ Lever board ID: ${finalLeverBoardId}`);
        console.log(`✅ Greenhouse board ID: ${finalGreenhouseBoardId}`);

        // 3. Migrate individual companies from job_boards to companies table
        // Companies that use Lever
        const leverCompanies = [
            { slug: 'yuno', name: 'Yuno', url: 'https://jobs.lever.co/yuno', description: 'Payments orchestration LATAM' },
            { slug: 'connectly', name: 'Connectly', url: 'https://jobs.lever.co/connectly', description: 'Customer messaging Brasil/LATAM' },
            { slug: 'clip', name: 'Clip', url: 'https://jobs.lever.co/payclip', description: 'Payments México' },
            { slug: 'kavak', name: 'Kavak', url: 'https://jobs.lever.co/kavak', description: 'Used cars México/Brasil/Argentina' },
            { slug: 'bitso', name: 'Bitso', url: 'https://jobs.lever.co/bitso', description: 'Crypto exchange LATAM' },
            { slug: 'kushki', name: 'Kushki', url: 'https://jobs.lever.co/kushki', description: 'Payments infrastructure LATAM' },
            { slug: 'binance', name: 'Binance', url: 'https://jobs.lever.co/binance', description: 'Largest crypto exchange' },
            { slug: 'coinbase', name: 'Coinbase', url: 'https://jobs.lever.co/coinbase', description: 'Cryptocurrency exchange' },
            { slug: 'kraken', name: 'Kraken', url: 'https://jobs.lever.co/kraken', description: 'Crypto exchange' },
            { slug: 'gemini', name: 'Gemini', url: 'https://jobs.lever.co/gemini', description: 'Crypto platform' },
            { slug: 'circle', name: 'Circle', url: 'https://jobs.lever.co/circle', description: 'USDC stablecoin' },
            { slug: 'chainalysis', name: 'Chainalysis', url: 'https://jobs.lever.co/chainalysis', description: 'Blockchain analytics' },
            { slug: 'stripe', name: 'Stripe', url: 'https://jobs.lever.co/stripe', description: 'Payment infrastructure' },
            { slug: 'netflix', name: 'Netflix', url: 'https://jobs.lever.co/netflix', description: 'Entertainment streaming' },
            { slug: 'uber', name: 'Uber', url: 'https://jobs.lever.co/uber', description: 'Ride-sharing' },
            { slug: 'reddit', name: 'Reddit', url: 'https://jobs.lever.co/reddit', description: 'Social network' },
            { slug: 'duolingo', name: 'Duolingo', url: 'https://jobs.lever.co/duolingo', description: 'Language learning' },
            { slug: 'databricks', name: 'Databricks', url: 'https://jobs.lever.co/databricks', description: 'Data & AI platform' },
            { slug: 'snowflake', name: 'Snowflake', url: 'https://jobs.lever.co/snowflake', description: 'Data cloud' },
            { slug: 'mongodb', name: 'MongoDB', url: 'https://jobs.lever.co/mongodb', description: 'NoSQL database' },
            { slug: 'elastic', name: 'Elastic', url: 'https://jobs.lever.co/elastic', description: 'Search & analytics' },
            { slug: 'datadog', name: 'Datadog', url: 'https://jobs.lever.co/datadog', description: 'Observability' },
            { slug: 'gitlab', name: 'GitLab', url: 'https://jobs.lever.co/gitlab', description: 'DevOps platform' },
            { slug: 'notion', name: 'Notion', url: 'https://jobs.lever.co/notion', description: 'All-in-one workspace' },
            { slug: 'figma', name: 'Figma', url: 'https://jobs.lever.co/figma', description: 'Design collaboration' },
            { slug: 'canva', name: 'Canva', url: 'https://jobs.lever.co/canva', description: 'Graphic design' },
        ];

        // Companies that use Greenhouse
        const greenhouseCompanies = [
            { slug: 'nubank', name: 'Nubank', url: 'https://boards.greenhouse.io/nubank', description: 'Banco digital Brasil/México/Colômbia' },
            { slug: 'gympass', name: 'Gympass', url: 'https://boards.greenhouse.io/gympass', description: 'Corporate wellness LATAM' },
            { slug: 'wildlife', name: 'Wildlife Studios', url: 'https://boards.greenhouse.io/wildlifestudios', description: 'Mobile gaming Brasil' },
            { slug: 'rappi', name: 'Rappi', url: 'https://boards.greenhouse.io/rappi', description: 'Super app Colômbia/México/Brasil' },
            { slug: 'deel', name: 'Deel', url: 'https://boards.greenhouse.io/deel', description: 'Global HR & payroll' },
            { slug: 'remote', name: 'Remote.com', url: 'https://boards.greenhouse.io/remotecom', description: 'Global payroll platform' },
            { slug: 'toptal', name: 'Toptal', url: 'https://boards.greenhouse.io/toptal', description: 'Freelance talent network' },
            { slug: 'zapier', name: 'Zapier', url: 'https://boards.greenhouse.io/zapier', description: 'Automation platform' },
            { slug: 'automattic', name: 'Automattic', url: 'https://boards.greenhouse.io/automattic', description: 'WordPress/WooCommerce' },
            { slug: 'airbnb', name: 'Airbnb', url: 'https://boards.greenhouse.io/airbnb', description: 'Travel & hospitality' },
            { slug: 'spotify', name: 'Spotify', url: 'https://boards.greenhouse.io/spotify', description: 'Music streaming' },
            { slug: 'shopify', name: 'Shopify', url: 'https://boards.greenhouse.io/shopify', description: 'E-commerce platform' },
            { slug: 'github', name: 'GitHub', url: 'https://boards.greenhouse.io/github', description: 'Developer platform' },
            { slug: 'slack', name: 'Slack', url: 'https://boards.greenhouse.io/slack', description: 'Team communication' },
            { slug: 'twilio', name: 'Twilio', url: 'https://boards.greenhouse.io/twilio', description: 'Communications API' },
            { slug: 'zendesk', name: 'Zendesk', url: 'https://boards.greenhouse.io/zendesk', description: 'Customer service' },
            { slug: 'atlassian', name: 'Atlassian', url: 'https://boards.greenhouse.io/atlassian', description: 'Jira/Confluence' },
        ];

        // 4. Insert companies into companies table and create job_board_companies relationships
        if (finalLeverBoardId) {
            for (const company of leverCompanies) {
                // Insert company
                await queryRunner.query(`
                    INSERT INTO companies (slug, name, platform, website, description, featured, "featuredOrder", rating, "reviewCount", "totalJobs")
                    VALUES ($1, $2, 'lever', $3, $4, false, 0, 0, 0, 0)
                    ON CONFLICT (slug) DO NOTHING
                `, [company.slug, company.name, company.url, company.description]);

                // Get company ID
                const [companyResult] = await queryRunner.query(`SELECT id FROM companies WHERE slug = $1`, [company.slug]);

                if (companyResult?.id) {
                    // Create relationship
                    await queryRunner.query(`
                        INSERT INTO job_board_companies (job_board_id, company_id, scraper_url, enabled)
                        VALUES ($1, $2, $3, true)
                        ON CONFLICT (job_board_id, company_id) DO NOTHING
                    `, [finalLeverBoardId, companyResult.id, company.url]);
                }
            }
        }

        if (finalGreenhouseBoardId) {
            for (const company of greenhouseCompanies) {
                // Insert company
                await queryRunner.query(`
                    INSERT INTO companies (slug, name, platform, website, description, featured, "featuredOrder", rating, "reviewCount", "totalJobs")
                    VALUES ($1, $2, 'greenhouse', $3, $4, false, 0, 0, 0, 0)
                    ON CONFLICT (slug) DO NOTHING
                `, [company.slug, company.name, company.url, company.description]);

                // Get company ID
                const [companyResult] = await queryRunner.query(`SELECT id FROM companies WHERE slug = $1`, [company.slug]);

                if (companyResult?.id) {
                    // Create relationship
                    await queryRunner.query(`
                        INSERT INTO job_board_companies (job_board_id, company_id, scraper_url, enabled)
                        VALUES ($1, $2, $3, true)
                        ON CONFLICT (job_board_id, company_id) DO NOTHING
                    `, [finalGreenhouseBoardId, companyResult.id, company.url]);
                }
            }
        }

        // 5. Delete individual companies from job_boards table (they should only be in companies table now)
        console.log('🗑️  Removing individual companies from job_boards table...');

        const companiesToDelete = [
            'yuno', 'connectly', 'clip', 'kavak', 'bitso', 'kushki',
            'binance', 'coinbase', 'kraken', 'gemini', 'circle', 'chainalysis',
            'stripe', 'netflix', 'uber', 'reddit', 'duolingo',
            'databricks', 'snowflake', 'mongodb', 'elastic', 'datadog', 'gitlab', 'notion', 'figma', 'canva',
            'nubank-gh', 'gympass-gh', 'wildlife-gh', 'rappi-gh',
            'deel-gh', 'remote-gh', 'toptal-gh', 'zapier-gh', 'automattic-gh',
            'airbnb-gh', 'spotify-gh', 'shopify-gh', 'github-gh', 'slack-gh', 'twilio-gh', 'zendesk-gh', 'atlassian-gh'
        ];

        const deleteResult = await queryRunner.query(`
            DELETE FROM job_boards
            WHERE slug = ANY($1::text[])
            RETURNING slug
        `, [companiesToDelete]);

        console.log(`✅ Deleted ${deleteResult.length} individual companies from job_boards`);
        console.log('✅ FixJobBoardsVsCompanies migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is destructive and cannot be easily reversed
        // The data has been reorganized from an incorrect structure to a correct one
        console.log('Cannot revert FixJobBoardsVsCompanies migration - data has been restructured');
    }

}
