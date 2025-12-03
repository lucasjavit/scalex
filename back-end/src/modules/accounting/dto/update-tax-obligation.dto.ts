import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

/**
 * DTO for updating a tax obligation
 *
 * Used to update tax obligation information (partial update).
 * Commonly used to update payment details, fines, or notes.
 */
export class UpdateTaxObligationDto {
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

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
