import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission, ModulePermission } from './entities/user-permission.entity';
import { User } from './entities/user.entity';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { isAdminRole } from '../common/types/user-roles.type';

@Injectable()
export class UserPermissionsService {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionsRepository: Repository<UserPermission>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Get permissions for a user
   * If user is admin, returns all permissions as true
   * If no permission record exists, creates one with defaults
   */
  async getUserPermissions(userId: string): Promise<UserPermission> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Admins have access to everything
    if (isAdminRole(user.role)) {
      return this.createAdminPermissions(userId);
    }

    // Try to find existing permissions
    let permissions = await this.userPermissionsRepository.findOne({
      where: { userId },
    });

    // If no permissions exist, create default ones
    if (!permissions) {
      permissions = await this.createDefaultPermissions(userId);
    }

    return permissions;
  }

  /**
   * Update permissions for a user
   * Admins cannot have their permissions updated (they always have full access)
   */
  async updateUserPermissions(
    userId: string,
    updateDto: UpdateUserPermissionsDto,
  ): Promise<UserPermission> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prevent updating admin permissions
    if (isAdminRole(user.role)) {
      throw new Error('Cannot update permissions for admin users');
    }

    // Find or create permissions
    let permissions = await this.userPermissionsRepository.findOne({
      where: { userId },
    });

    if (!permissions) {
      permissions = this.userPermissionsRepository.create({
        userId,
        ...updateDto,
      });
    } else {
      // Update only the fields that were provided
      Object.assign(permissions, updateDto);
    }

    return this.userPermissionsRepository.save(permissions);
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
    userId: string,
    module: ModulePermission,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      return false;
    }

    // Admins always have permission
    if (isAdminRole(user.role)) {
      return true;
    }

    const permissions = await this.userPermissionsRepository.findOne({
      where: { userId },
    });

    if (!permissions) {
      // No permissions record means only default permissions (conversation)
      return module === ModulePermission.LEARNING_CONVERSATION;
    }

    return permissions.hasPermission(module);
  }

  /**
   * Get all users with their permissions
   * Used by admin panel
   */
  async getAllUsersWithPermissions(): Promise<
    Array<{ user: User; permissions: UserPermission }>
  > {
    const users = await this.usersRepository.find({
      order: { created_at: 'DESC' },
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const permissions = await this.getUserPermissions(user.id);
        return { user, permissions };
      }),
    );

    return result;
  }

  /**
   * Create default permissions for a new user
   * By default, users only have access to conversation
   */
  private async createDefaultPermissions(
    userId: string,
  ): Promise<UserPermission> {
    const permissions = this.userPermissionsRepository.create({
      userId,
      learningCourse: false,
      learningConversation: true, // Default: conversation enabled
      businessAccounting: false,
      businessCareer: false,
      businessJobs: false,
      businessInsurance: false,
      businessBanking: false,
    });

    return this.userPermissionsRepository.save(permissions);
  }

  /**
   * Create virtual admin permissions (all true)
   * This is not saved to database, just returned for API consistency
   */
  private createAdminPermissions(userId: string): UserPermission {
    const permissions = new UserPermission();
    permissions.userId = userId;
    permissions.learningCourse = true;
    permissions.learningConversation = true;
    permissions.businessAccounting = true;
    permissions.businessCareer = true;
    permissions.businessJobs = true;
    permissions.businessInsurance = true;
    permissions.businessBanking = true;
    return permissions;
  }

  /**
   * Delete permissions for a user
   * Used when a user is deleted (cascade should handle this)
   */
  async deleteUserPermissions(userId: string): Promise<void> {
    await this.userPermissionsRepository.delete({ userId });
  }
}
