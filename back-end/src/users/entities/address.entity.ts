import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AddressType {
  PRIMARY = 'primary',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  OTHER = 'other',
}

@Entity('addresses')
@Check(`"address_type" IN ('primary', 'billing', 'shipping', 'other')`)
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.addresses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 20,
    default: AddressType.PRIMARY,
    nullable: false,
    comment: 'Type of address: primary, billing, shipping, other',
  })
  address_type: AddressType;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  street: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  number: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  complement: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  neighborhood: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'State/Province name',
  })
  state: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  postal_code: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Country name',
  })
  country: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Flag indicating if this is the user primary address',
  })
  is_primary: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
