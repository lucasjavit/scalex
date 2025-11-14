import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';

/**
 * Status enum for company registration requests
 */
export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WAITING_DOCUMENTS = 'waiting_documents',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * CompanyRegistrationRequest Entity
 *
 * Represents a request from a user to open a company (CNPJ).
 * The request goes through multiple stages managed by an accountant.
 *
 * Flow:
 * 1. User creates request (status: PENDING)
 * 2. System assigns accountant (assignedTo)
 * 3. Accountant contacts user and starts process (status: IN_PROGRESS)
 * 4. Accountant requests documents (status: WAITING_DOCUMENTS)
 * 5. User sends documents, accountant processes (status: PROCESSING)
 * 6. Company is opened and registered (status: COMPLETED, companyId set)
 *
 * Can be CANCELLED at any stage.
 */
@Entity('company_registration_requests')
export class CompanyRegistrationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedToId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ name: 'request_data', type: 'jsonb' })
  requestData: Record<string, any>;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date | null;
}
