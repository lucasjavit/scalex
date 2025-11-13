import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { JobBoardCompany } from './job-board-company.entity';

@Entity('companies')
@Index(['slug'], { unique: true })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string; // 'stripe', 'coinbase'

  @Column()
  name: string; // 'Stripe', 'Coinbase'

  @Column({ type: 'enum', enum: ['lever', 'greenhouse', 'ashby', 'workable', 'builtin', 'remoteyeah'] })
  platform: 'lever' | 'greenhouse' | 'ashby' | 'workable' | 'builtin' | 'remoteyeah';

  @Column({ nullable: true })
  logo: string; // URL do logo

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  size: string; // '1000-5000'

  @Column({ nullable: true })
  industry: string; // 'Payments', 'Crypto', etc

  @Column({ type: 'simple-array', nullable: true })
  locations: string[]; // ['San Francisco', 'Remote', 'Brazil']

  @Column({ default: false })
  featured: boolean; // Top 20?

  @Column({ default: 0 })
  featuredOrder: number; // Ordem de exibição (0-19)

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // 4.8

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: 0 })
  totalJobs: number; // Cache do total de vagas (atualizado pelo cron)

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Platform-specific metadata (e.g., builtinCompanyId for Built In)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => JobBoardCompany, (jbc) => jbc.company)
  jobBoardCompanies: JobBoardCompany[];
}
