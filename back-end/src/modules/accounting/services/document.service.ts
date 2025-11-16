import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestDocument } from '../entities/request-document.entity';
import { CompanyRegistrationRequest } from '../entities/company-registration-request.entity';
import { CompanyDocument, DocumentCategory } from '../entities/company-document.entity';
import { Company } from '../entities/company.entity';
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
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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
    documentType: string,
  ): Promise<RequestDocument> {
    // 1. Validate request exists
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    // 2. Validate user authorization
    const isOwner = request.userId === userId;
    const isAssignedAccountant = request.assignedToId === userId;

    if (!isOwner && !isAssignedAccountant) {
      throw new BadRequestException(
        'Only the request owner or assigned accountant can upload documents',
      );
    }

    // 3. Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // 4. Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
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
    });

    // 9. Save to database
    return await this.documentRepository.save(document);
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
   * @param userId - User deleting (must be document uploader)
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    // 1. Find document
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // 2. Validate authorization (only uploader can delete)
    if (document.uploadedBy !== userId) {
      throw new BadRequestException(
        'Only the document uploader can delete this document',
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
      throw new NotFoundException(`Document with ID ${documentId} not found`);
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
   * @returns Created company document record
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
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // 2. Validate user authorization (company owner or accountant)
    const isOwner = company.userId === userId;
    const isAccountant = company.accountantId === userId;

    if (!isOwner && !isAccountant) {
      throw new BadRequestException(
        'Only the company owner or accountant can upload documents',
      );
    }

    // 3. Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // 4. Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
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
      throw new NotFoundException(`Company document with ID ${documentId} not found`);
    }

    return document;
  }

  /**
   * Delete a company document
   *
   * @param documentId - Document ID
   * @param userId - User deleting (must be document uploader or company accountant)
   */
  async deleteCompanyDocument(documentId: string, userId: string): Promise<void> {
    // 1. Find document with company relation
    const document = await this.companyDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['company'],
    });

    if (!document) {
      throw new NotFoundException(`Company document with ID ${documentId} not found`);
    }

    // 2. Validate authorization (uploader or company accountant can delete)
    const isUploader = document.uploadedById === userId;
    const isAccountant = document.company.accountantId === userId;

    if (!isUploader && !isAccountant) {
      throw new BadRequestException(
        'Only the document uploader or company accountant can delete this document',
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
      throw new NotFoundException(`Company document with ID ${documentId} not found`);
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
