import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional, IsArray, IsUUID, Min } from 'class-validator';
import { QuestionDifficulty } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsUUID()
  lessonId: string;

  @IsInt()
  @Min(1)
  questionNumber: number;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsNotEmpty()
  expectedAnswer: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alternativeAnswers?: string[];

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
