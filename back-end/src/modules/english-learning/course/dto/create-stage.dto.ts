import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateStageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  orderIndex: number;
}
