import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CompanyRegistrationRequest } from './entities/company-registration-request.entity';
import { RequestDocument } from './entities/request-document.entity';
import { AccountingMessage } from './entities/accounting-message.entity';
import { AccountingCompany } from './entities/accounting-company.entity';
import { TaxObligation } from './entities/tax-obligation.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { RegistrationRequestService } from './services/registration-request.service';
import { MessageService } from './services/message.service';
import { DocumentService } from './services/document.service';
import { CompanyService } from './services/company.service';
import { TaxObligationService } from './services/tax-obligation.service';
import { RegistrationRequestController } from './controllers/registration-request.controller';
import { MessageController } from './controllers/message.controller';
import { DocumentController } from './controllers/document.controller';
import { CompanyController } from './controllers/company.controller';
import { TaxObligationController } from './controllers/tax-obligation.controller';
import { User } from '../../users/entities/user.entity';
import { FirebaseModule } from '../../common/firebase/firebase.module';
import { UsersModule } from '../../users/users.module';

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
      AccountingCompany,
      TaxObligation,
      CompanyDocument,
      User, // Needed for accountant assignment
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Store tax obligation PDFs in uploads/tax-obligations
          const uploadPath = 'uploads/tax-obligations';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Generate unique filename: {taxType}-{month}-{year}-{timestamp}{ext}
          // Example: das-01-2024-1673894567890.pdf
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          const body = req.body;
          const monthStr = String(body.referenceMonth).padStart(2, '0');
          const filename = `${body.taxType || 'tax'}-${monthStr}-${body.referenceYear || '0000'}-${uniqueSuffix}${ext}`;
          cb(null, filename.toLowerCase());
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for PDFs
      },
    }),
    FirebaseModule, // For FirebaseAuthGuard
    UsersModule, // For UsersService
  ],
  controllers: [
    RegistrationRequestController,
    MessageController,
    DocumentController,
    CompanyController,
    TaxObligationController,
  ],
  providers: [
    RegistrationRequestService,
    MessageService,
    DocumentService,
    CompanyService,
    TaxObligationService,
  ],
  exports: [
    RegistrationRequestService,
    MessageService,
    DocumentService,
    CompanyService,
    TaxObligationService,
  ],
})
export class AccountingModule {}
