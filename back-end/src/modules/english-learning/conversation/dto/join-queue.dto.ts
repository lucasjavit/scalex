import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  @Length(1, 128, { message: 'User ID must be between 1 and 128 characters' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Level is required' })
  @IsIn(['beginner', 'intermediate', 'advanced'], {
    message: 'Level must be one of: beginner, intermediate, advanced',
  })
  level: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Topic must be between 1 and 50 characters' })
  topic?: string;

  @IsOptional()
  @IsString()
  @Length(2, 5, { message: 'Language code must be between 2 and 5 characters' })
  language?: string;
}
