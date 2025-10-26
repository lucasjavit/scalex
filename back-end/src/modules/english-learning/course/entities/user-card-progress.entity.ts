import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Card } from './card.entity';

export type CardState = 'new' | 'learning' | 'review';

@Entity('user_card_progress')
@Unique(['userId', 'cardId'])
export class UserCardProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'card_id' })
  cardId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 2.5, name: 'ease_factor' })
  easeFactor: number;

  @Column({ type: 'int', default: 0 })
  interval: number;

  @Column({ type: 'int', default: 0 })
  repetitions: number;

  @Column({ type: 'varchar', length: 20, default: 'new' })
  state: CardState;

  @Column({ type: 'timestamp', name: 'next_review_date' })
  nextReviewDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_reviewed_at' })
  lastReviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Card, (card) => card.userProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;
}
