import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyRegistrationRequest } from './entities/company-registration-request.entity';
import { RequestDocument } from './entities/request-document.entity';
import { RegistrationRequestService } from './services/registration-request.service';
import { User } from '../../users/entities/user.entity';

/**
 * Accounting Module
 *
 * Manages company registration requests and related documents.
 * Allows users to request CNPJ opening through accountants.
 *
 * Features:
 * - Create and manage registration requests
 * - Assign accountants to requests
 * - Track request status (pending → in_progress → completed)
 * - Upload and manage request documents
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyRegistrationRequest,
      RequestDocument,
      User, // Needed for accountant assignment
    ]),
  ],
  controllers: [],
  providers: [RegistrationRequestService],
  exports: [RegistrationRequestService],
})
export class AccountingModule {}
