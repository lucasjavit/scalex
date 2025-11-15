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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from '../services/document.service';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { UploadDocumentDto } from '../dto/upload-document.dto';

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
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
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
    await this.documentService.deleteDocument(documentId, req.user.id);
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
}
