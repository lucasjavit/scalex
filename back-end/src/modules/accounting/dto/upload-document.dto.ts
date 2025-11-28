import { IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { DocumentType } from '../entities/request-document.entity';

/**
 * DTO for uploading a document to a registration request
 *
 * Validation rules:
 * - requestId: must be a valid UUID
 * - documentType: required, must be a valid DocumentType enum value
 */
export class UploadDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;
}
