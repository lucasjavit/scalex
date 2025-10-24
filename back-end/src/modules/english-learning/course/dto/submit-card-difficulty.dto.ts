import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export enum CardDifficulty {
  AGAIN = 'again',
  HARD = 'hard',
  GOOD = 'good',
  EASY = 'easy',
}

export class SubmitCardDifficultyDto {
  @IsUUID()
  questionId: string;

  @IsEnum(CardDifficulty)
  @IsNotEmpty()
  difficulty: CardDifficulty;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseTimeSeconds?: number;
}
