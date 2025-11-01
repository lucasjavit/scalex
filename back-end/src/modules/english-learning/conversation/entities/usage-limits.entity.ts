import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_call_usage_limits')
export class VideoCallUsageLimits {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_rooms_created', type: 'int', default: 0 })
  totalRoomsCreated: number;

  @Column({ name: 'total_minutes_used', type: 'int', default: 0 })
  totalMinutesUsed: number;

  @Column({ name: 'max_rooms_allowed', type: 'int', default: 100000 })
  maxRoomsAllowed: number;

  @Column({ name: 'max_minutes_allowed', type: 'int', default: 10000 })
  maxMinutesAllowed: number;

  @Column({ name: 'last_reset_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastResetAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
