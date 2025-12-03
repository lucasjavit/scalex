import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

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
  @Length(2, 2, { message: 'State must be 2 characters (e.g., SP, RJ)' })
  state: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'ZIP code must be in format 12345-678' })
  zip_code: string;
}

/**
 * Company type enum
 */
export enum CompanyType {
  MEI = 'MEI',
  EIRELI = 'EIRELI',
  LTDA = 'LTDA',
  SA = 'SA',
  OUTROS = 'OUTROS',
}

/**
 * Urgency level enum
 */
export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * DTO for creating a company registration request
 *
 * This DTO validates all required fields for a user to request
 * opening a company (CNPJ) through an accountant.
 */
export class CreateRegistrationRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255, { message: 'Full name must be between 3 and 255 characters' })
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, {
    message: 'CPF must be in format 123.456.789-00',
  })
  cpf: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-\(\)]+$/, {
    message: 'Phone must contain only numbers and valid characters',
  })
  @MaxLength(50)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Business type must not exceed 255 characters' })
  business_type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  estimated_revenue: string;

  @IsBoolean()
  will_have_employees: boolean;

  @IsEnum(CompanyType, {
    message: 'Preferred company type must be one of: MEI, EIRELI, LTDA, SA, OUTROS',
  })
  preferred_company_type: CompanyType;

  @IsBoolean()
  has_commercial_address: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsEnum(UrgencyLevel, {
    message: 'Urgency must be one of: low, medium, high, urgent',
  })
  @IsOptional()
  urgency?: UrgencyLevel;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;
}
