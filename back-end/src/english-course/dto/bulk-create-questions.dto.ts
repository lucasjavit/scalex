import { IsArray, IsString, IsNumber, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty } from '../entities/question.entity';

export class CreateQuestionBulkDto {
  @IsNumber()
  questionNumber: number;

  @IsString()
  questionText: string;

  @IsString()
  expectedAnswer: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeAnswers?: string[];

  @IsOptional()
  @IsString()
  grammarPoint?: string;

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class BulkCreateQuestionsDto {
  @IsString()
  lessonId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionBulkDto)
  questions: CreateQuestionBulkDto[];
}
