import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AuditEntity } from '../../../../common/entities/audit.entity';
import { Unit } from './unit.entity';
import { UserCardProgress } from './user-card-progress.entity';
import { ReviewSession } from './review-session.entity';

@Entity('cards')
export class Card extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'unit_id' })
  unitId: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'text', nullable: true, name: 'example_sentence' })
  exampleSentence: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'audio_url' })
  audioUrl: string;

  @Column({ type: 'int', default: 0, name: 'order_index' })
  orderIndex: number;

  // Relations
  @ManyToOne(() => Unit, (unit) => unit.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @OneToMany(() => UserCardProgress, (progress) => progress.card)
  userProgress: UserCardProgress[];

  @OneToMany(() => ReviewSession, (session) => session.card)
  reviewSessions: ReviewSession[];
}
