import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCardDto {
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;
}
