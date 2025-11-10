import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { JobBoardCompany } from './job-board-company.entity';

@Entity('job_boards')
export class JobBoard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  scraper: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 3 })
  priority: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => JobBoardCompany, (jbc) => jbc.jobBoard)
  jobBoardCompanies: JobBoardCompany[];
}
