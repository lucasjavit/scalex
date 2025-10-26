import { IsUUID, IsNotEmpty, IsIn, IsInt, IsOptional } from 'class-validator';

export class SubmitReviewDto {
  @IsUUID()
  @IsNotEmpty()
  cardId: string;

  @IsIn(['wrong', 'hard', 'good', 'easy'])
  @IsNotEmpty()
  result: 'wrong' | 'hard' | 'good' | 'easy';

  @IsInt()
  @IsOptional()
  timeTakenSeconds?: number;
}
