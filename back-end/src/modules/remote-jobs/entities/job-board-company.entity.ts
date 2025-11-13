import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JobBoard } from './job-board.entity';
import { Company } from './company.entity';

/**
 * Tabela pivot que relaciona job boards com companies
 * Permite configurar quais empresas scrape ar para cada plataforma
 */
@Entity('job_board_companies')
@Index(['jobBoardId', 'companyId'], { unique: true })
export class JobBoardCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_board_id', type: 'uuid' })
  jobBoardId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'scraper_url', type: 'varchar' })
  scraperUrl: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ name: 'last_scraped_at', type: 'timestamp', nullable: true })
  lastScrapedAt: Date | null;

  @Column({ name: 'scraping_status', type: 'varchar', nullable: true })
  scrapingStatus: 'success' | 'error' | 'pending' | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => JobBoard, (jobBoard) => jobBoard.jobBoardCompanies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_board_id' })
  jobBoard: JobBoard;

  @ManyToOne(() => Company, (company) => company.jobBoardCompanies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
