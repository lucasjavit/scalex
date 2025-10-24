import { IsString, IsNotEmpty, IsUUID, IsInt, IsOptional, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  userAnswer: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseTimeSeconds?: number;
}
