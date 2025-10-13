import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ProgressStatus } from '../entities/user-progress.entity';

export class UpdateProgressDto {
  @IsEnum(ProgressStatus)
  @IsOptional()
  status?: ProgressStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  correctAnswers?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalAttempts?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  accuracyPercentage?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  timeSpentMinutes?: number;
}
