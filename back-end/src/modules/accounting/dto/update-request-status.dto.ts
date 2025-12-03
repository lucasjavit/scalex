import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RequestStatus } from '../entities/company-registration-request.entity';

/**
 * DTO for updating the status of a registration request
 *
 * Used by accountants to move the request through different stages
 * or by users/accountants to cancel the request.
 */
export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus, {
    message: 'Status must be one of: pending, in_progress, waiting_documents, processing, completed, cancelled',
  })
  @IsNotEmpty()
  status: RequestStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Status note must not exceed 500 characters' })
  status_note?: string;
}
