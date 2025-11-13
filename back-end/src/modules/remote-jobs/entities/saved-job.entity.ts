import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from '../../../users/entities/user.entity';

@Entity('saved_jobs')
@Index(['userId', 'jobId'], { unique: true })
@Index(['userId'])
@Index(['status'])
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({
    type: 'enum',
    enum: ['saved', 'applied', 'interviewing', 'rejected', 'accepted'],
    default: 'saved',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string; // Anotações pessoais do usuário

  @Column({ type: 'timestamp', nullable: true })
  appliedAt: Date; // Quando marcou como "aplicado"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
