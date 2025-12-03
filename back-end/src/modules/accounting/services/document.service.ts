import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestDocument, DocumentType } from '../entities/request-document.entity';
import { CompanyRegistrationRequest } from '../entities/company-registration-request.entity';
import { CompanyDocument, DocumentCategory } from '../entities/company-document.entity';
import { AccountingCompany } from '../entities/accounting-company.entity';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DocumentService
 *
 * Handles document uploads and management for registration requests.
 *
 * Features:
 * - Upload documents (PDF, images, etc.)
 * - List documents for a request
 * - Delete documents
 * - Download documents
 *
 * Business Rules:
 * - Only request owner or assigned accountant can upload documents
 * - Only document uploader can delete documents
 * - File size limit: 10MB
 * - Allowed file types: PDF, JPG, PNG, JPEG
 * - Files stored in uploads/request-documents/{requestId}/
 */
@Injectable()
export class DocumentService {
  // File upload constraints
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  private readonly UPLOAD_BASE_PATH = 'uploads/request-documents';

  constructor(
    @InjectRepository(RequestDocument)
    private readonly documentRepository: Repository<RequestDocument>,
    @InjectRepository(CompanyRegistrationRequest)
    private readonly requestRepository: Repository<CompanyRegistrationRequest>,
    @InjectRepository(CompanyDocument)
    private readonly companyDocumentRepository: Repository<CompanyDocument>,
    @InjectRepository(AccountingCompany)
    private readonly companyRepository: Repository<AccountingCompany>,
  ) {}

  /**
   * Upload a document for a registration request
   *
   * @param requestId - Request ID
   * @param userId - User uploading (must be request owner or assigned accountant)
   * @param file - File to upload
   * @param documentType - Type of document (e.g., "RG", "CPF", "Comprovante de Residência")
   * @returns Created document record
   */
  async uploadRequestDocument(
    requestId: string,
    userId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
  ): Promise<RequestDocument> {
    // 1. Validate request exists
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Solicitação não encontrada. Verifique se o ID está correto.`);
    }

    // 2. Validate user authorization
    const isOwner = request.userId === userId;
    const isAssignedAccountant = request.assignedToId === userId;

    if (!isOwner && !isAssignedAccountant) {
      throw new BadRequestException(
        'Você não tem permissão para enviar documentos nesta solicitação. Apenas o solicitante ou o contador responsável podem fazer upload.',
      );
    }

    // 3. Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `O arquivo é muito grande. O tamanho máximo permitido é ${this.MAX_FILE_SIZE / 1024 / 1024}MB.`,
      );
    }

    // 4. Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Apenas arquivos PDF e imagens (JPG, PNG) são aceitos.`,
      );
    }

    // 5. Generate file path
    const uploadDir = path.join(this.UPLOAD_BASE_PATH, requestId);
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(file.originalname);
    const fileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // 6. Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 7. Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // 8. Create document record
    const document = this.documentRepository.create({
      requestId,
      uploadedBy: userId,
      documentType,
      fileName: sanitizedFileName,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    // 9. Save to database
    return this.documentRepository.save(document);
  }

  /**
   * Get all documents for a registration request
   *
   * @param requestId - Request ID
   * @returns Array of documents ordered by creation date (newest first)
   */
  async getRequestDocuments(requestId: string): Promise<RequestDocument[]> {
    return await this.documentRepository.find({
      where: { requestId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete a document
   *
   * @param documentId - Document ID
   * @param userId - User deleting
   * @param userRole - Role of the user deleting (to check if accountant)
   */
  async deleteDocument(documentId: string, userId: string, userRole: string): Promise<void> {
    // 1. Find document
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Documento não encontrado. Ele pode ter sido removido anteriormente.`);
    }

    // 2. Validate authorization
    // Users can delete their own documents
    // Accountants (partner_cnpj or admin) can delete any document
    const isUploader = document.uploadedBy === userId;
    const isAccountant = userRole === 'partner_cnpj' || userRole === 'admin';

    if (!isUploader && !isAccountant) {
      throw new BadRequestException(
        'Você não tem permissão para excluir este documento. Apenas quem enviou ou um contador pode removê-lo.',
      );
    }

    // 3. Delete file from disk (if exists)
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // 4. Delete record from database
    await this.documentRepository.delete(documentId);
  }

  /**
   * Get the file path for a document (for download)
   *
   * @param documentId - Document ID
   * @returns Full file path
   */
  async getDocumentPath(documentId: string): Promise<string> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Documento não encontrado. Ele pode ter sido removido.`);
    }

    return document.filePath;
  }

  /**
   * Sanitize file name to prevent path traversal attacks
   *
   * @param fileName - Original file name
   * @returns Sanitized file name
   */
  private sanitizeFileName(fileName: string): string {
    // Remove any path separators and keep only the file name
    return path.basename(fileName).replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  // ========================================
  // COMPANY DOCUMENT METHODS
  // ========================================

  /**
   * Upload a document for a company
   *
   * @param companyId - Company ID
   * @param userId - User uploading (must be company owner or accountant)
   * @param file - File to upload
   * @param category - Document category (constituicao, registros, certidoes, fiscais)
   * @param documentType - Specific document type
   * @param expirationDate - Optional expiration date for certificates
   * @param notes - Optional notes
   * @returns Created accounting company document record
   */
  async uploadCompanyDocument(
    companyId: string,
    userId: string,
    file: Express.Multer.File,
    category: DocumentCategory,
    documentType: string,
    expirationDate?: string,
    notes?: string,
  ): Promise<CompanyDocument> {
    // 1. Validate company exists
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Empresa não encontrada. Verifique se o ID está correto.`);
    }

    // 2. Validate user authorization (company owner or accountant)
    const isOwner = company.userId === userId;
    const isAccountant = company.accountantId === userId;

    if (!isOwner && !isAccountant) {
      throw new BadRequestException(
        'Você não tem permissão para enviar documentos nesta empresa. Apenas o proprietário ou o contador responsável podem fazer upload.',
      );
    }

    // 3. Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `O arquivo é muito grande. O tamanho máximo permitido é ${this.MAX_FILE_SIZE / 1024 / 1024}MB.`,
      );
    }

    // 4. Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Apenas arquivos PDF e imagens (JPG, PNG) são aceitos.`,
      );
    }

    // 5. Generate file path
    const uploadDir = path.join('uploads/company-documents', companyId, category);
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(file.originalname);
    const fileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // 6. Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 7. Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // 8. Create document record
    const document = this.companyDocumentRepository.create({
      companyId,
      uploadedById: userId,
      category,
      documentType,
      fileName: sanitizedFileName,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      notes,
    });

    // 9. Save to database
    return await this.companyDocumentRepository.save(document);
  }

  /**
   * Get all documents for a company
   *
   * @param companyId - Company ID
   * @param category - Optional category filter
   * @returns Array of company documents ordered by creation date (newest first)
   */
  async getCompanyDocuments(
    companyId: string,
    category?: DocumentCategory,
  ): Promise<CompanyDocument[]> {
    const where: any = { companyId };

    if (category) {
      where.category = category;
    }

    return await this.companyDocumentRepository.find({
      where,
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single company document by ID
   *
   * @param documentId - Document ID
   * @returns Company document with relations
   */
  async getCompanyDocumentById(documentId: string): Promise<CompanyDocument> {
    const document = await this.companyDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['company', 'uploadedBy'],
    });

    if (!document) {
      throw new NotFoundException(`Documento não encontrado. Ele pode ter sido removido.`);
    }

    return document;
  }

  /**
   * Delete a company document
   *
   * @param documentId - Document ID
   * @param userId - User deleting
   * @param userRole - Role of the user deleting (to check if accountant)
   */
  async deleteCompanyDocument(documentId: string, userId: string, userRole: string): Promise<void> {
    // 1. Find document with company relation
    const document = await this.companyDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['company'],
    });

    if (!document) {
      throw new NotFoundException(`Documento não encontrado. Ele pode ter sido removido anteriormente.`);
    }

    // 2. Validate authorization
    // Users can delete their own documents
    // Accountants (partner_cnpj or admin) can delete any document
    const isUploader = document.uploadedById === userId;
    const isAccountant = userRole === 'partner_cnpj' || userRole === 'admin';

    if (!isUploader && !isAccountant) {
      throw new BadRequestException(
        'Você não tem permissão para excluir este documento. Apenas quem enviou ou um contador pode removê-lo.',
      );
    }

    // 3. Delete file from disk (if exists)
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // 4. Delete record from database
    await this.companyDocumentRepository.delete(documentId);
  }

  /**
   * Get the file path for a company document (for download)
   *
   * @param documentId - Document ID
   * @returns Full file path
   */
  async getCompanyDocumentPath(documentId: string): Promise<string> {
    const document = await this.companyDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Documento não encontrado. Ele pode ter sido removido.`);
    }

    return document.filePath;
  }

  /**
   * Get documents expiring soon (within 30 days) for a company
   *
   * @param companyId - Company ID
   * @returns Array of documents expiring soon
   */
  async getExpiringDocuments(companyId: string): Promise<CompanyDocument[]> {
    const documents = await this.companyDocumentRepository.find({
      where: { companyId },
      relations: ['uploadedBy'],
    });

    // Filter documents expiring within 30 days
    return documents.filter((doc) => doc.isExpiringSoon());
  }
}
