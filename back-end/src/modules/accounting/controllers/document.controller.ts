import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentService } from '../services/document.service';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { UploadCompanyDocumentDto } from '../dto/upload-company-document.dto';
import { DocumentCategory } from '../entities/company-document.entity';
import { DocumentType } from '../entities/request-document.entity';

/**
 * DocumentController
 *
 * Handles document upload, listing, download, and deletion for registration requests.
 *
 * Endpoints:
 * - POST   /api/accounting/documents/upload          - Upload a document
 * - GET    /api/accounting/documents/request/:id     - List documents for a request
 * - DELETE /api/accounting/documents/:id             - Delete a document
 * - GET    /api/accounting/documents/:id/download    - Get download path for a document
 *
 * All routes protected with FirebaseAuthGuard.
 */
@Controller('accounting/documents')
@UseGuards(FirebaseAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Upload a document for a registration request
   *
   * @param req - Request with authenticated user
   * @param file - File uploaded via multipart/form-data
   * @param dto - Upload metadata (requestId, documentType)
   * @returns Created document record
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado. Por favor, selecione um arquivo para upload.');
    }

    return await this.documentService.uploadRequestDocument(
      dto.requestId,
      req.user.id,
      file,
      dto.documentType,
    );
  }

  /**
   * Get all documents for a registration request
   *
   * @param requestId - Request ID
   * @returns Array of documents
   */
  @Get('request/:id')
  async getRequestDocuments(@Param('id') requestId: string) {
    return await this.documentService.getRequestDocuments(requestId);
  }

  /**
   * Delete a document
   *
   * @param documentId - Document ID
   * @param req - Request with authenticated user
   */
  @Delete(':id')
  async deleteDocument(@Param('id') documentId: string, @Req() req: any) {
    await this.documentService.deleteDocument(documentId, req.user.id, req.user.role);
  }

  /**
   * Get download path for a document
   *
   * @param documentId - Document ID
   * @returns Object with filePath
   */
  @Get(':id/download')
  async downloadDocument(@Param('id') documentId: string) {
    const filePath = await this.documentService.getDocumentPath(documentId);
    return { filePath };
  }

  // ========================================
  // COMPANY DOCUMENT ENDPOINTS
  // ========================================

  /**
   * Upload a document for a company
   *
   * POST /api/accounting/documents/company/upload
   *
   * @param req - Request with authenticated user
   * @param file - File uploaded via multipart/form-data
   * @param dto - Upload metadata (companyId, category, documentType, expirationDate, notes)
   * @returns Created accounting company document record
   */
  @Post('company/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadCompanyDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCompanyDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado. Por favor, selecione um arquivo para upload.');
    }

    return await this.documentService.uploadCompanyDocument(
      dto.companyId,
      req.user.id,
      file,
      dto.category,
      dto.documentType,
      dto.expirationDate,
      dto.notes,
    );
  }

  /**
   * Get all documents for a company
   *
   * GET /api/accounting/documents/company/:id
   *
   * @param companyId - Company ID
   * @param category - Optional category filter (constituicao, registros, certidoes, fiscais)
   * @returns Array of company documents
   */
  @Get('company/:id')
  async getCompanyDocuments(
    @Param('id') companyId: string,
    @Query('category') category?: DocumentCategory,
  ) {
    return await this.documentService.getCompanyDocuments(companyId, category);
  }

  /**
   * Get a single company document by ID
   *
   * GET /api/accounting/documents/company-doc/:id
   *
   * @param documentId - Document ID
   * @returns Company document with relations
   */
  @Get('company-doc/:id')
  async getCompanyDocumentById(@Param('id') documentId: string) {
    return await this.documentService.getCompanyDocumentById(documentId);
  }

  /**
   * Delete a company document
   *
   * DELETE /api/accounting/documents/company/:id
   *
   * @param documentId - Document ID
   * @param req - Request with authenticated user
   */
  @Delete('company/:id')
  async deleteCompanyDocument(@Param('id') documentId: string, @Req() req: any) {
    await this.documentService.deleteCompanyDocument(documentId, req.user.id, req.user.role);
  }

  /**
   * Get download path for a company document
   *
   * GET /api/accounting/documents/company/:id/download
   *
   * @param documentId - Document ID
   * @returns Object with filePath
   */
  @Get('company-doc/:id/download')
  async downloadCompanyDocument(@Param('id') documentId: string) {
    const filePath = await this.documentService.getCompanyDocumentPath(documentId);
    return { filePath };
  }

  /**
   * Get documents expiring soon for a company
   *
   * GET /api/accounting/documents/company/:id/expiring
   *
   * @param companyId - Company ID
   * @returns Array of documents expiring within 30 days
   */
  @Get('company/:id/expiring')
  async getExpiringDocuments(@Param('id') companyId: string) {
    return await this.documentService.getExpiringDocuments(companyId);
  }
}
