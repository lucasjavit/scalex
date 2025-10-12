import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(1, 255, { message: 'Full name must be between 1 and 255 characters' })
  full_name?: string;

  @IsDateString({}, { message: 'Birth date must be a valid date' })
  @IsOptional()
  birth_date?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Phone must not exceed 50 characters' })
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Phone must contain only numbers and valid characters',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @Length(2, 10, { message: 'Preferred language must be between 2 and 10 characters' })
  preferred_language?: string;
}
