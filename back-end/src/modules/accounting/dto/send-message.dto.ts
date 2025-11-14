import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * DTO for sending a message
 *
 * Message must be linked to either a request OR a company (XOR).
 * This is validated in the service layer.
 */
export class SendMessageDto {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  attachment?: string;
}
