import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for updating user permissions
 *
 * All fields are optional to allow partial updates.
 * Only include the permissions you want to change.
 */
export class UpdateUserPermissionsDto {
  @IsOptional()
  @IsBoolean()
  learningCourse?: boolean;

  @IsOptional()
  @IsBoolean()
  learningConversation?: boolean;

  @IsOptional()
  @IsBoolean()
  businessAccounting?: boolean;

  @IsOptional()
  @IsBoolean()
  businessCareer?: boolean;

  @IsOptional()
  @IsBoolean()
  businessJobs?: boolean;

  @IsOptional()
  @IsBoolean()
  businessInsurance?: boolean;

  @IsOptional()
  @IsBoolean()
  businessBanking?: boolean;
}
