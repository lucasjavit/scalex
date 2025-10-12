import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Country } from './country.entity';
import { Address } from '../../users/entities/address.entity';

@Entity('states')
@Unique(['country', 'code'])
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Country, (country) => country.states, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'varchar', length: 10, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => Address, (address) => address.state)
  addresses: Address[];
}
