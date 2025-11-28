import { IsEnum } from 'class-validator';
import { ModuleType } from '../entities/conversation.entity';

export class GetConversationsDto {
  @IsEnum(ModuleType)
  moduleType: ModuleType;
}
