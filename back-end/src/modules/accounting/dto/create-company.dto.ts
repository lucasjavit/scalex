import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  ValidateNested,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CompanyType, TaxRegime } from '../entities/accounting-company.entity';

/**
 * Address DTO for nested validation
 */
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @Matches(/^[A-Z]{2}$/, { message: 'State must be 2 uppercase letters (e.g., SP, RJ)' })
  state: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'ZIP code must be in format XXXXX-XXX' })
  zipCode: string;
}

/**
 * DTO for creating a new company
 *
 * Used by accountants to register a company after successful CNPJ opening.
 *
 * Validation rules:
 * - All required fields must be present
 * - CNPJ must be valid format (XX.XXX.XXX/XXXX-XX or digits only)
 * - Company type must be valid enum value
 * - Tax regime must be valid enum value
 * - Opening date must be valid date
 * - Estimated revenue must be positive number
 * - Address must be complete and valid
 */
export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  legalName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  tradeName?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, {
    message: 'CNPJ must be in format XX.XXX.XXX/XXXX-XX or 14 digits',
  })
  cnpj: string;

  @IsEnum(CompanyType, {
    message: 'Company type must be one of: MEI, ME, EIRELI, LTDA, SA',
  })
  companyType: CompanyType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  mainActivity: string;

  @IsEnum(TaxRegime, {
    message: 'Regime tributário deve ser: Simples Nacional, Lucro Presumido ou Lucro Real',
  })
  taxRegime: TaxRegime;

  @IsDateString()
  openingDate: string;

  @IsNumber()
  @Min(0)
  estimatedRevenue: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  stateRegistration?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  municipalRegistration?: string;
}
