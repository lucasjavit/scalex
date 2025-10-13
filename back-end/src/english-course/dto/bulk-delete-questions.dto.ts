import { IsArray, IsString } from 'class-validator';

export class BulkDeleteQuestionsDto {
  @IsArray()
  @IsString({ each: true })
  questionIds: string[];
}
