import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { QuestionDifficulty } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsUUID()
  lessonId: string;

  @IsInt()
  @Min(1)
  questionNumber: number;

  @IsString()
  @IsNotEmpty()
  frontText: string;

  @IsString()
  @IsNotEmpty()
  backText: string;

  @IsString()
  @IsOptional()
  grammarPoint?: string;

  @IsEnum(QuestionDifficulty)
  @IsOptional()
  difficulty?: QuestionDifficulty;

  @IsString()
  @IsOptional()
  audioUrl?: string;
}
