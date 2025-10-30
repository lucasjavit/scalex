import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('video_call_active_periods')
export class VideoCallActivePeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'start_hour', type: 'int' })
  startHour: number;

  @Column({ name: 'start_minute', type: 'int' })
  startMinute: number;

  @Column({ name: 'end_hour', type: 'int' })
  endHour: number;

  @Column({ name: 'end_minute', type: 'int' })
  endMinute: number;

  @Column({ name: 'order_index', type: 'int' })
  @Index('IDX_VIDEO_CALL_PERIODS_ORDER')
  orderIndex: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
