import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaxType } from '../entities/tax-obligation.entity';

/**
 * DTO for uploading monthly tax PDF
 *
 * Used by accountants to upload government-generated tax PDFs
 * for a specific company, month, and year.
 *
 * Validation rules:
 * - Company ID is required
 * - Tax type must be valid enum value
 * - Reference month must be 1-12 (integer)
 * - Reference year must be 2000-2100 (integer)
 * - Due date must be valid date
 * - Amount must be positive number
 * - File will be validated separately by Multer (PDF only)
 */
export class UploadMonthlyTaxDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsEnum(TaxType, {
    message:
      'Tax type must be one of: DAS, DARF, GPS, ISS, ICMS, IRPJ, CSLL, PIS, COFINS, INSS, FGTS',
  })
  taxType: TaxType;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Reference month must be between 1 and 12' })
  @Max(12, { message: 'Reference month must be between 1 and 12' })
  referenceMonth: number;

  @Type(() => Number)
  @IsNumber()
  @Min(2000, { message: 'Reference year must be between 2000 and 2100' })
  @Max(2100, { message: 'Reference year must be between 2000 and 2100' })
  referenceYear: number;

  @IsDateString()
  dueDate: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Amount must be a positive number' })
  amount: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  fineAmount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  interestAmount?: number;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  paymentLink?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
