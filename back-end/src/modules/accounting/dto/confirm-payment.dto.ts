import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

/**
 * DTO for confirming tax payment
 *
 * Used when a payment is confirmed by the user or accountant.
 */
export class ConfirmPaymentDto {
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @IsString()
  @IsOptional()
  paymentConfirmation?: string;
}
