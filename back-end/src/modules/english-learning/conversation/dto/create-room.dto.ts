import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  @Length(1, 128, { message: 'User ID must be between 1 and 128 characters' })
  userId: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Topic must be between 1 and 50 characters' })
  topic?: string;

  @IsOptional()
  @IsString()
  @Length(2, 5, { message: 'Language code must be between 2 and 5 characters' })
  language?: string;

  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'], {
    message: 'Level must be one of: beginner, intermediate, advanced',
  })
  level?: string;

  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  @Max(60, { message: 'Duration must not exceed 60 minutes (1 hour)' })
  duration?: number; // Duration in MINUTES (not seconds)
}
