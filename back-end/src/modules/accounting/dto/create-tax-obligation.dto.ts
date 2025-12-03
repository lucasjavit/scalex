import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Matches,
} from 'class-validator';
import { TaxType } from '../entities/tax-obligation.entity';

/**
 * DTO for creating a tax obligation
 *
 * Used by accountants to generate monthly tax obligations for companies.
 *
 * Validation rules:
 * - Company ID is required
 * - Tax type must be valid enum value
 * - Reference month must be in YYYY-MM format
 * - Due date must be valid date
 * - Amount must be positive number
 * - Optional fields: barcode, payment link, document URL, notes
 */
export class CreateTaxObligationDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsEnum(TaxType, {
    message:
      'Tax type must be one of: DAS, DARF, GPS, ISS, ICMS, IRPJ, CSLL, PIS, COFINS, INSS, FGTS',
  })
  taxType: TaxType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Reference month must be in format YYYY-MM (e.g., 2024-01)',
  })
  referenceMonth: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fineAmount?: number;

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
  documentUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
