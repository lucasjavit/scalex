import { IsOptional, IsString } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  userId: string;

  @IsString()
  level: string; // 'beginner', 'intermediate', 'advanced'

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
