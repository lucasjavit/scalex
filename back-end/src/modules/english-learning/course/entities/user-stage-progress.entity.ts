import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Stage } from './stage.entity';

@Entity('user_stage_progress')
@Unique(['userId', 'stageId'])
export class UserStageProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'stage_id' })
  stageId: string;

  @Column({ type: 'boolean', default: false, name: 'is_completed' })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date;

  // Relations
  @ManyToOne(() => Stage, (stage) => stage.userProgress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stage_id' })
  stage: Stage;
}
