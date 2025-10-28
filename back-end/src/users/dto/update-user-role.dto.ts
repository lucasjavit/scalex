import { IsEnum, IsNotEmpty } from 'class-validator';
import type { UserRole } from '../../common/types/user-roles.type';
import { USER_ROLES } from '../../common/types/user-roles.type';

export class UpdateUserRoleDto {
  @IsEnum(USER_ROLES, {
    message: `Role must be one of: ${USER_ROLES.join(', ')}`,
  })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}
