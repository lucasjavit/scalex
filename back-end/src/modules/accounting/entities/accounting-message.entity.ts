import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CompanyRegistrationRequest } from './company-registration-request.entity';
import { User } from '../../../users/entities/user.entity';

/**
 * AccountingMessage Entity
 *
 * Represents a chat message between users and accountants.
 *
 * Messages can be linked to either:
 * - A company registration request (pre-company)
 * - A company (post-company - future implementation)
 *
 * Features:
 * - Sender/receiver tracking
 * - Read status tracking
 * - Optional file attachments
 * - Chronological ordering
 *
 * Relationships:
 * - request: The registration request this message belongs to (optional)
 * - sender: User who sent the message
 * - receiver: User who receives the message
 * - company: The company this message belongs to (future, optional)
 */
@Entity('accounting_messages')
export class AccountingMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * FK to company_registration_requests
   * Used for chat during the registration process (before company exists)
   */
  @Column({ type: 'uuid', nullable: true })
  requestId: string;

  @ManyToOne(
    () => CompanyRegistrationRequest,
    (request) => request.messages,
    { nullable: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'request_id' })
  request: CompanyRegistrationRequest;

  /**
   * FK to companies
   * Used for chat after company is created
   * TODO: Add relationship when Company entity is created (STEP 15)
   */
  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  // @ManyToOne(() => Company, (company) => company.messages, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'company_id' })
  // company: Company;

  /**
   * FK to users (sender)
   */
  @Column({ type: 'uuid', nullable: false })
  senderId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  /**
   * FK to users (receiver)
   */
  @Column({ type: 'uuid', nullable: false })
  receiverId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  /**
   * Message content
   */
  @Column({ type: 'text', nullable: false })
  message: string;

  /**
   * Optional file attachment path
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  attachmentPath: string;

  /**
   * Read status
   */
  @Column({ type: 'boolean', default: false, nullable: false })
  isRead: boolean;

  /**
   * When message was read
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt: Date;

  /**
   * Message creation timestamp
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
