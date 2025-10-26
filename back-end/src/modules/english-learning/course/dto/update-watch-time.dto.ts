import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateWatchTimeDto {
  @IsInt()
  @IsNotEmpty()
  watchTimeSeconds: number;
}
