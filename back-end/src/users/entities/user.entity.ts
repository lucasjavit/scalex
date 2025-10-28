import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import type { UserRole } from '../../common/types/user-roles.type';
import { USER_ROLES } from '../../common/types/user-roles.type';

@Entity('users')
@Check(`"email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`)
@Check(`"birth_date" <= CURRENT_DATE`)
@Check(`"phone" ~* '^[\\d\\s\\-\\+\\(\\)]+$'`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'varchar', 
    length: 128, 
    unique: true, 
    nullable: false,
    comment: 'Firebase Authentication UID - unique identifier'
  })
  firebase_uid: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    unique: true, 
    nullable: false,
    comment: 'User email from Firebase Auth'
  })
  email: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    comment: 'User full name'
  })
  full_name: string;

  @Column({ 
    type: 'date', 
    nullable: false,
    comment: 'User date of birth'
  })
  birth_date: Date;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: false,
    comment: 'Primary contact phone number'
  })
  phone: string;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: false,
    comment: 'User preferred language code (e.g., pt-BR, en-US)'
  })
  preferred_language: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Soft delete flag - false means user is deactivated'
  })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: USER_ROLES,
    default: 'user',
    comment: 'User role: user (default), admin, or partner_* (specific module partner)'
  })
  role: UserRole;

  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
    eager: false,
  })
  addresses: Address[];

  @CreateDateColumn({ 
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at: Date;

  @UpdateDateColumn({ 
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  updated_at: Date;
}
