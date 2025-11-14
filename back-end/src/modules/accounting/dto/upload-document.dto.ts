import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * DTO for uploading a document to a registration request
 *
 * Validation rules:
 * - requestId: must be a valid UUID
 * - documentType: required, max 100 characters (e.g., "RG", "CPF", "Comprovante de Residência")
 */
export class UploadDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  documentType: string;
}
