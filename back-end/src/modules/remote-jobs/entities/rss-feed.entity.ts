import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JobBoard } from './job-board.entity';

@Entity('rss_feeds')
export class RssFeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_board_id' })
  jobBoardId: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 200 })
  category: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'last_scraped_at', type: 'timestamp', nullable: true })
  lastScrapedAt: Date | null;

  @Column({
    name: 'scraping_status',
    type: 'enum',
    enum: ['pending', 'success', 'error'],
    nullable: true,
  })
  scrapingStatus: 'pending' | 'success' | 'error' | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => JobBoard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_board_id' })
  jobBoard: JobBoard;
}
