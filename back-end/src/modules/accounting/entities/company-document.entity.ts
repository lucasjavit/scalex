import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { AccountingCompany } from './accounting-company.entity';
import { User } from '../../../users/entities/user.entity';

/**
 * Document Category Enum
 *
 * Categories for organizing company documents
 */
export enum DocumentCategory {
  CONSTITUICAO = 'constituicao', // Bylaws, amendments
  REGISTROS = 'registros', // CNPJ card, licenses, MEI certificate
  CERTIDOES = 'certidoes', // Negative certificates (federal, state, municipal)
  FISCAIS = 'fiscais', // Paid tax guides, declarations
}

/**
 * CompanyDocument Entity
 *
 * Represents documents uploaded for a company after it's created.
 * Includes contracts, licenses, certificates, and tax documents.
 *
 * Features:
 * - Document categorization (constituição, registros, certidões, fiscais)
 * - File metadata tracking (name, path, size, MIME type)
 * - Expiration date for certificates
 * - Upload tracking (who uploaded and when)
 * - Notes for additional context
 * - Automatic expiration alerts (30 days before)
 */
@Entity('company_documents')
export class CompanyDocument extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => AccountingCompany, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: AccountingCompany;

  @Column({ name: 'uploaded_by_id' })
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'category',
  })
  category: DocumentCategory;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'document_type',
    comment: 'Specific document type (e.g., "Contrato Social", "CNPJ Card")',
  })
  documentType: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'file_name',
  })
  fileName: string;

  @Column({
    type: 'text',
    name: 'file_path',
  })
  filePath: string;

  @Column({
    type: 'integer',
    name: 'file_size',
  })
  fileSize: number;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'mime_type',
  })
  mimeType: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'expiration_date',
  })
  expirationDate?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Helper Methods

  /**
   * Check if document is expired
   */
  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date() > new Date(this.expirationDate);
  }

  /**
   * Check if document is expiring soon (within 30 days)
   */
  isExpiringSoon(): boolean {
    if (!this.expirationDate) return false;
    const today = new Date();
    const expirationDate = new Date(this.expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
  }

  /**
   * Get days until expiration (negative if expired)
   */
  getDaysUntilExpiration(): number | null {
    if (!this.expirationDate) return null;
    const today = new Date();
    const expirationDate = new Date(this.expirationDate);
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get file size in a human-readable format
   */
  getFormattedFileSize(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get category display name in Portuguese
   */
  getCategoryDisplayName(): string {
    const names: Record<DocumentCategory, string> = {
      [DocumentCategory.CONSTITUICAO]: 'Constituição',
      [DocumentCategory.REGISTROS]: 'Registros',
      [DocumentCategory.CERTIDOES]: 'Certidões',
      [DocumentCategory.FISCAIS]: 'Fiscais',
    };
    return names[this.category] || this.category;
  }

  /**
   * Get expiration status color for UI
   */
  getExpirationStatusColor(): string {
    if (!this.expirationDate) return 'gray'; // No expiration
    if (this.isExpired()) return 'red'; // Expired
    if (this.isExpiringSoon()) return 'yellow'; // Expiring soon
    return 'green'; // Valid
  }

  /**
   * Check if document has expiration date
   */
  hasExpirationDate(): boolean {
    return this.expirationDate !== null && this.expirationDate !== undefined;
  }

  /**
   * Get file extension from file name
   */
  getFileExtension(): string {
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Check if document is a PDF
   */
  isPDF(): boolean {
    return this.mimeType === 'application/pdf' || this.getFileExtension() === 'pdf';
  }

  /**
   * Check if document is an image
   */
  isImage(): boolean {
    return (
      this.mimeType.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(this.getFileExtension())
    );
  }
}
