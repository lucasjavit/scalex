import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

/**
 * Message Entity
 *
 * Represents a single message within a conversation.
 * Messages are always associated with a conversation and have sender/receiver.
 */
@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['receiverId', 'isRead'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ type: 'uuid', name: 'receiver_id' })
  receiverId: string;

  @Column({
    type: 'text',
    comment: 'Message content',
  })
  content: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Optional file attachment path',
  })
  attachment: string | null;

  @Column({
    type: 'boolean',
    name: 'is_read',
    default: false,
    comment: 'Whether the message has been read by receiver',
  })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
