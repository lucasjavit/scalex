import { IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  duration?: number;
}
