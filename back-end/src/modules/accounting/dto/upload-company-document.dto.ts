import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { DocumentCategory } from '../entities/company-document.entity';

/**
 * DTO for uploading a company document
 *
 * Used by accountants and company owners to upload documents for a company.
 *
 * Validation rules:
 * - Company ID is required
 * - Category must be valid enum value
 * - Document type is required
 * - Expiration date is optional (for certificates)
 * - Notes are optional
 */
export class UploadCompanyDocumentDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsEnum(DocumentCategory, {
    message: 'Category must be one of: constituicao, registros, certidoes, fiscais',
  })
  category: DocumentCategory;

  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
