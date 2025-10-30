import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuditEntity } from '../../../../common/entities/audit.entity';
import { Unit } from './unit.entity';
import { UserStageProgress } from './user-stage-progress.entity';

@Entity('stages')
export class Stage extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'order_index' })
  orderIndex: number;

  // Relations
  @OneToMany(() => Unit, (unit) => unit.stage)
  units: Unit[];

  @OneToMany(() => UserStageProgress, (progress) => progress.stage)
  userProgress: UserStageProgress[];
}
