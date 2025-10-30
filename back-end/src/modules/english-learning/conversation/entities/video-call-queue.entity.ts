import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum QueueStatus {
  WAITING = 'waiting',
  MATCHED = 'matched',
  EXPIRED = 'expired',
}

@Entity('video_call_queue')
export class VideoCallQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index('IDX_VIDEO_CALL_QUEUE_USER_ID')
  userId: string;

  @Column()
  level: string;

  @Column()
  topic: string;

  @Column()
  language: string;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({
    type: 'varchar',
    default: QueueStatus.WAITING,
  })
  @Index('IDX_VIDEO_CALL_QUEUE_STATUS')
  status: QueueStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
