import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128, { message: 'Firebase UID must not exceed 128 characters' })
  firebase_uid: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'Email format is invalid',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255, { message: 'Full name must be between 1 and 255 characters' })
  full_name: string;

  @IsDateString({}, { message: 'Birth date must be a valid date' })
  @IsNotEmpty()
  birth_date: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Phone must not exceed 50 characters' })
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Phone must contain only numbers and valid characters',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 10, { message: 'Preferred language must be between 2 and 10 characters' })
  preferred_language: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  @IsOptional()
  addresses?: CreateAddressDto[];
}
