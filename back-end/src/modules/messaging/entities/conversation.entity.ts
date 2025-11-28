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
import { User } from '../../../users/entities/user.entity';

/**
 * Module types for conversations
 */
export enum ModuleType {
  ACCOUNTING = 'accounting',
  ENGLISH = 'english',
  CAREER = 'career',
  JOBS = 'jobs',
  INSURANCE = 'insurance',
  BANKING = 'banking',
}

/**
 * Conversation Entity
 *
 * Represents a conversation between a partner and a user within a specific module.
 * Each conversation is unique per (partnerId, userId, moduleType) combination.
 */
@Entity('conversations')
@Index(['partnerId', 'userId', 'moduleType'], { unique: true })
@Index(['partnerId', 'moduleType'])
@Index(['userId', 'moduleType'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: User;

  @Column({ type: 'uuid', name: 'partner_id' })
  partnerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ModuleType,
    name: 'module_type',
    comment: 'Module context for this conversation',
  })
  moduleType: ModuleType;

  @Column({
    type: 'timestamp',
    name: 'last_message_at',
    nullable: true,
    comment: 'Timestamp of last message in conversation',
  })
  lastMessageAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
