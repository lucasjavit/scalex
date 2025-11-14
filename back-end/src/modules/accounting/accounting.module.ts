import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyRegistrationRequest } from './entities/company-registration-request.entity';
import { RequestDocument } from './entities/request-document.entity';
import { AccountingMessage } from './entities/accounting-message.entity';
import { RegistrationRequestService } from './services/registration-request.service';
import { MessageService } from './services/message.service';
import { RegistrationRequestController } from './controllers/registration-request.controller';
import { MessageController } from './controllers/message.controller';
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
 * - Chat/messaging between users and accountants
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyRegistrationRequest,
      RequestDocument,
      AccountingMessage,
      User, // Needed for accountant assignment
    ]),
  ],
  controllers: [RegistrationRequestController, MessageController],
  providers: [RegistrationRequestService, MessageService],
  exports: [RegistrationRequestService, MessageService],
})
export class AccountingModule {}
