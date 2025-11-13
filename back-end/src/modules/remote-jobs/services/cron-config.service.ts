import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CronConfig } from '../entities/cron-config.entity';

@Injectable()
export class CronConfigService {
  private readonly logger = new Logger(CronConfigService.name);
  private readonly CRON_KEY = 'job_scraping_cron';

  constructor(
    @InjectRepository(CronConfig)
    private readonly cronConfigRepository: Repository<CronConfig>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Get current cron configuration
   */
  async getCronConfig(): Promise<CronConfig> {
    let config = await this.cronConfigRepository.findOne({
      where: { key: this.CRON_KEY },
    });

    if (!config) {
      // Create default config if not exists
      config = await this.cronConfigRepository.save({
        key: this.CRON_KEY,
        value: '0 */4 * * *',
        description: 'Cron expression for job scraping - runs every 4 hours by default',
      });
      this.logger.log('✅ Created default cron config: every 4 hours');
    }

    return config;
  }

  /**
   * Update cron expression and restart the cron job
   */
  async updateCronExpression(
    cronExpression: string,
    callback: () => Promise<void>,
  ): Promise<CronConfig> {
    this.logger.log(`🔄 Updating cron expression to: ${cronExpression}`);

    // Validate cron expression by attempting to create a CronJob
    try {
      new CronJob(cronExpression, () => {});
    } catch (error) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    // Update in database
    let config = await this.getCronConfig();
    config.value = cronExpression;
    config = await this.cronConfigRepository.save(config);

    // Restart the cron job with new expression
    await this.restartCronJob(cronExpression, callback);

    this.logger.log(`✅ Cron updated successfully: ${cronExpression}`);
    return config;
  }

  /**
   * Restart the cron job with a new expression
   */
  private async restartCronJob(
    cronExpression: string,
    callback: () => Promise<void>,
  ): Promise<void> {
    const jobName = 'job-scraping';

    try {
      // Stop and delete existing job if exists
      if (this.schedulerRegistry.getCronJobs().has(jobName)) {
        const existingJob = this.schedulerRegistry.getCronJob(jobName);
        existingJob.stop();
        this.schedulerRegistry.deleteCronJob(jobName);
        this.logger.log(`🛑 Stopped existing cron job: ${jobName}`);
      }
    } catch (error) {
      this.logger.warn(`⚠️  No existing job to stop: ${jobName}`);
    }

    // Create new job with updated expression
    const job = new CronJob(cronExpression, async () => {
      this.logger.log(`⏰ Cron triggered: ${cronExpression}`);
      await callback();
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();

    this.logger.log(`▶️  Started new cron job with expression: ${cronExpression}`);
  }

  /**
   * Get cron expression description in human-readable format
   */
  getCronDescription(cronExpression: string): string {
    // Parse common cron patterns
    const patterns: Record<string, string> = {
      '* * * * *': 'Every minute',
      '*/1 * * * *': 'Every 1 minute',
      '*/2 * * * *': 'Every 2 minutes',
      '*/5 * * * *': 'Every 5 minutes',
      '*/10 * * * *': 'Every 10 minutes',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 * * * *': 'Every hour',
      '0 */2 * * *': 'Every 2 hours',
      '0 */3 * * *': 'Every 3 hours',
      '0 */4 * * *': 'Every 4 hours',
      '0 */6 * * *': 'Every 6 hours',
      '0 */12 * * *': 'Every 12 hours',
      '0 0 * * *': 'Daily at midnight',
      '0 0 * * 0': 'Weekly on Sunday at midnight',
      '0 0 1 * *': 'Monthly on the 1st at midnight',
    };

    return patterns[cronExpression] || 'Custom schedule';
  }

  /**
   * Get suggested cron expressions
   */
  getSuggestedExpressions(): Array<{ expression: string; description: string }> {
    return [
      { expression: '*/1 * * * *', description: 'Every 1 minute' },
      { expression: '*/2 * * * *', description: 'Every 2 minutes' },
      { expression: '*/5 * * * *', description: 'Every 5 minutes' },
      { expression: '*/10 * * * *', description: 'Every 10 minutes' },
      { expression: '*/15 * * * *', description: 'Every 15 minutes' },
      { expression: '*/30 * * * *', description: 'Every 30 minutes' },
      { expression: '0 * * * *', description: 'Every hour' },
      { expression: '0 */2 * * *', description: 'Every 2 hours' },
      { expression: '0 */3 * * *', description: 'Every 3 hours' },
      { expression: '0 */4 * * *', description: 'Every 4 hours (default)' },
      { expression: '0 */6 * * *', description: 'Every 6 hours' },
      { expression: '0 */12 * * *', description: 'Every 12 hours' },
      { expression: '0 0 * * *', description: 'Daily at midnight' },
    ];
  }
}
