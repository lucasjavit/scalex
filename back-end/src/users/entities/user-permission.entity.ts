import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Module permissions that can be granted to users
 */
export enum ModulePermission {
  // English Learning Module
  LEARNING_COURSE = 'learning.course',
  LEARNING_CONVERSATION = 'learning.conversation',

  // Business Suite Modules
  BUSINESS_ACCOUNTING = 'business.accounting',
  BUSINESS_CAREER = 'business.career',
  BUSINESS_JOBS = 'business.jobs',
  BUSINESS_INSURANCE = 'business.insurance',
  BUSINESS_BANKING = 'business.banking',
}

/**
 * User Permission Entity
 *
 * Stores granular permissions for each user to access specific modules.
 * Admins always have access to all modules, but this table allows
 * fine-grained control for regular users.
 */
@Entity('user_permissions')
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  // English Learning Permissions
  @Column({ type: 'boolean', default: false, name: 'learning_course' })
  learningCourse: boolean;

  @Column({ type: 'boolean', default: true, name: 'learning_conversation' })
  learningConversation: boolean;

  // Business Suite Permissions
  @Column({ type: 'boolean', default: false, name: 'business_accounting' })
  businessAccounting: boolean;

  @Column({ type: 'boolean', default: false, name: 'business_career' })
  businessCareer: boolean;

  @Column({ type: 'boolean', default: false, name: 'business_jobs' })
  businessJobs: boolean;

  @Column({ type: 'boolean', default: false, name: 'business_insurance' })
  businessInsurance: boolean;

  @Column({ type: 'boolean', default: false, name: 'business_banking' })
  businessBanking: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Check if user has a specific module permission
   */
  hasPermission(module: ModulePermission): boolean {
    const permissionMap: Record<ModulePermission, boolean> = {
      [ModulePermission.LEARNING_COURSE]: this.learningCourse,
      [ModulePermission.LEARNING_CONVERSATION]: this.learningConversation,
      [ModulePermission.BUSINESS_ACCOUNTING]: this.businessAccounting,
      [ModulePermission.BUSINESS_CAREER]: this.businessCareer,
      [ModulePermission.BUSINESS_JOBS]: this.businessJobs,
      [ModulePermission.BUSINESS_INSURANCE]: this.businessInsurance,
      [ModulePermission.BUSINESS_BANKING]: this.businessBanking,
    };

    return permissionMap[module] || false;
  }

  /**
   * Get all granted permissions as an array
   */
  getGrantedPermissions(): ModulePermission[] {
    const permissions: ModulePermission[] = [];

    if (this.learningCourse) permissions.push(ModulePermission.LEARNING_COURSE);
    if (this.learningConversation) permissions.push(ModulePermission.LEARNING_CONVERSATION);
    if (this.businessAccounting) permissions.push(ModulePermission.BUSINESS_ACCOUNTING);
    if (this.businessCareer) permissions.push(ModulePermission.BUSINESS_CAREER);
    if (this.businessJobs) permissions.push(ModulePermission.BUSINESS_JOBS);
    if (this.businessInsurance) permissions.push(ModulePermission.BUSINESS_INSURANCE);
    if (this.businessBanking) permissions.push(ModulePermission.BUSINESS_BANKING);

    return permissions;
  }
}
