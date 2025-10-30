import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AuditEntity } from '../../../../common/entities/audit.entity';
import { Stage } from './stage.entity';
import { Card } from './card.entity';
import { UserUnitProgress } from './user-unit-progress.entity';

@Entity('units')
export class Unit extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'stage_id' })
  stageId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, name: 'youtube_url' })
  youtubeUrl: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'thumbnail_url',
  })
  thumbnailUrl: string;

  @Column({ type: 'int', nullable: true, name: 'video_duration' })
  videoDuration: number;

  @Column({ type: 'int', name: 'order_index' })
  orderIndex: number;

  // Relations
  @ManyToOne(() => Stage, (stage) => stage.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage: Stage;

  @OneToMany(() => Card, (card) => card.unit)
  cards: Card[];

  @OneToMany(() => UserUnitProgress, (progress) => progress.unit)
  userProgress: UserUnitProgress[];
}
