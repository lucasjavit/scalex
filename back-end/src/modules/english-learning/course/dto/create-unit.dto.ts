import { IsString, IsNotEmpty, IsOptional, IsInt, IsUUID } from 'class-validator';

export class CreateUnitDto {
  @IsUUID()
  @IsNotEmpty()
  stageId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  youtubeUrl: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsInt()
  @IsOptional()
  videoDuration?: number;

  @IsInt()
  @IsNotEmpty()
  orderIndex: number;
}
