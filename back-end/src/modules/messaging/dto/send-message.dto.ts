import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ModuleType } from '../entities/conversation.entity';

export class SendMessageDto {
  @IsUUID()
  receiverId: string;

  @IsEnum(ModuleType)
  moduleType: ModuleType;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  attachment?: string;
}
