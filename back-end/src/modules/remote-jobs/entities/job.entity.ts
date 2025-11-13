import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('jobs')
@Index(['externalId', 'platform'], { unique: true })
@Index(['companySlug'])
@Index(['publishedAt'])
@Index(['status'])
@Index(['isActive'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalId: string; // ID na plataforma original (Lever, Greenhouse, etc)

  @Column()
  platform: string; // Nome do job board/plataforma

  @Column({ nullable: true })
  companySlug?: string; // Deprecated: kept for backward compatibility, use companyId

  @Column({ nullable: true })
  companyId?: string; // FK para Company (UUID)

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @Column()
  title: string; // 'Senior Backend Engineer'

  @Column({ type: 'text' })
  description: string; // Descrição completa em HTML/Markdown

  @Column()
  location: string; // 'Remote - Brazil'

  @Column({ nullable: true })
  salary?: string; // '$120k - $150k/year'

  @Column({ default: false })
  remote: boolean;

  @Column({ type: 'simple-array', nullable: true })
  countries: string[]; // ['Brazil', 'Mexico', 'Argentina']

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // ['nodejs', 'typescript', 'postgresql']

  @Column({
    type: 'enum',
    enum: ['entry', 'intern', 'junior', 'mid', 'senior', 'staff', 'principal'],
    nullable: true,
  })
  seniority: string;

  @Column({
    type: 'enum',
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time',
  })
  employmentType: string;

  @Column({ type: 'simple-array', nullable: true })
  requirements: string[]; // ['5+ years', 'Node.js expert']

  @Column({ type: 'simple-array', nullable: true })
  benefits: string[]; // ['Remote', 'Health insurance']

  @Column()
  externalUrl: string; // URL para aplicar (Lever, Greenhouse, etc)

  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp' })
  scrapedAt: Date; // Quando foi coletado

  @Column({ type: 'timestamp', nullable: true })
  firstSeenAt: Date; // Quando a vaga foi vista pela primeira vez

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date; // Última vez que a vaga foi vista no scraping

  @Column({ default: true })
  isActive: boolean; // Se a vaga está ativa (ainda aparece no job board)

  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'filled'],
    default: 'active',
  })
  status: string;

  @Column({ default: 0 })
  applicantCount: number; // Estimativa de candidatos (se disponível)

  @Column({ unique: true, nullable: true })
  hash: string; // SHA-256 para deduplicação

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
