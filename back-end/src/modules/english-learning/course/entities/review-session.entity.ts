import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Card } from './card.entity';

export type ReviewResult = 'wrong' | 'hard' | 'good' | 'easy';

@Entity('review_sessions')
export class ReviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'card_id' })
  cardId: string;

  @Column({ type: 'varchar', length: 20 })
  result: ReviewResult;

  @Column({ type: 'int', nullable: true, name: 'time_taken_seconds' })
  timeTakenSeconds: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    name: 'ease_factor_after',
  })
  easeFactorAfter: number;

  @Column({ type: 'int', nullable: true, name: 'interval_after' })
  intervalAfter: number;

  @CreateDateColumn({ name: 'reviewed_at' })
  reviewedAt: Date;

  // Relations
  @ManyToOne(() => Card, (card) => card.reviewSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;
}
