import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('video_call_sessions')
export class VideoCallSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', unique: true })
  sessionId: string;

  @Column({ name: 'user1_id' })
  @Index('IDX_VIDEO_CALL_SESSIONS_USER1')
  user1Id: string;

  @Column({ name: 'user2_id' })
  @Index('IDX_VIDEO_CALL_SESSIONS_USER2')
  user2Id: string;

  @Column({ name: 'room_name' })
  roomName: string;

  @Column()
  level: string;

  @Column()
  topic: string;

  @Column()
  language: string;

  @Column({
    name: 'started_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  startedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'varchar',
    default: SessionStatus.ACTIVE,
  })
  @Index('IDX_VIDEO_CALL_SESSIONS_STATUS')
  status: SessionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
