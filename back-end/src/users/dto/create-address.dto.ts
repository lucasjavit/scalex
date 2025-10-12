import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class CreateAddressDto {
  @IsEnum(AddressType, { message: 'Address type must be one of: primary, billing, shipping, other' })
  @IsOptional()
  address_type?: AddressType = AddressType.PRIMARY;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Street must not exceed 255 characters' })
  street?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Number must not exceed 20 characters' })
  number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Complement must not exceed 100 characters' })
  complement?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Neighborhood must not exceed 100 characters' })
  neighborhood?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'State must not exceed 100 characters' })
  state?: string;

  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  @MaxLength(20, { message: 'Postal code must not exceed 20 characters' })
  postal_code: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country: string;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean = false;
}
