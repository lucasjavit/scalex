import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RssFeed } from '../entities/rss-feed.entity';

@Injectable()
export class RssFeedService {
  constructor(
    @InjectRepository(RssFeed)
    private readonly rssFeedRepository: Repository<RssFeed>,
  ) {}

  /**
   * Find all enabled RSS feeds for a job board
   */
  async findEnabledByJobBoard(jobBoardId: string): Promise<RssFeed[]> {
    return this.rssFeedRepository.find({
      where: {
        jobBoardId,
        enabled: true,
      },
      order: {
        category: 'ASC',
      },
    });
  }

  /**
   * Update scraping status of an RSS feed
   */
  async updateScrapingStatus(
    feedId: string,
    status: 'pending' | 'success' | 'error',
    errorMessage?: string,
  ): Promise<void> {
    await this.rssFeedRepository.update(feedId, {
      scrapingStatus: status,
      lastScrapedAt: new Date(),
      errorMessage: errorMessage || null,
    });
  }

  /**
   * Find all RSS feeds (for admin)
   */
  async findAll(): Promise<RssFeed[]> {
    return this.rssFeedRepository.find({
      relations: ['jobBoard'],
      order: {
        category: 'ASC',
      },
    });
  }

  /**
   * Create new RSS feed
   */
  async create(data: Partial<RssFeed>): Promise<RssFeed> {
    const feed = this.rssFeedRepository.create(data);
    return this.rssFeedRepository.save(feed);
  }

  /**
   * Update RSS feed
   */
  async update(id: string, data: Partial<RssFeed>): Promise<RssFeed> {
    await this.rssFeedRepository.update(id, data);
    const updated = await this.rssFeedRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`RSS feed with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Delete RSS feed
   */
  async delete(id: string): Promise<void> {
    await this.rssFeedRepository.delete(id);
  }

  /**
   * Toggle RSS feed enabled status
   */
  async toggle(id: string): Promise<RssFeed> {
    const feed = await this.rssFeedRepository.findOne({ where: { id } });
    if (!feed) {
      throw new Error(`RSS feed with ID ${id} not found`);
    }
    feed.enabled = !feed.enabled;
    return this.rssFeedRepository.save(feed);
  }
}
