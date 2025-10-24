import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';
import { LessonLevel } from '../entities/lesson.entity';

export class CreateLessonDto {
  @IsInt()
  @Min(1)
  lessonNumber: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LessonLevel)
  level: LessonLevel;

  @IsString()
  @IsOptional()
  grammarFocus?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  vocabularyFocus?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
