import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyRegistrationRequest } from './company-registration-request.entity';
import { User } from '../../../users/entities/user.entity';

/**
 * Document type enum for company registration requests
 */
export enum DocumentType {
  RG = 'rg',
  CPF = 'cpf',
  COMPROVANTE_RESIDENCIA = 'comprovante_residencia',
  CERTIDAO_NASCIMENTO = 'certidao_nascimento',
  CERTIDAO_CASAMENTO = 'certidao_casamento',
  TITULO_ELEITOR = 'titulo_eleitor',
  CONTRATO_SOCIAL = 'contrato_social',
  REQUERIMENTO_MEI = 'requerimento_mei',
  OUTROS = 'outros',
}

/**
 * RequestDocument Entity
 *
 * Represents a document uploaded during the company registration request process.
 * Documents can be uploaded by the user or by the assigned accountant.
 *
 * Examples:
 * - RG (Identity Card)
 * - CPF (Tax ID)
 * - Comprovante de Residência (Proof of Address)
 * - Certidão de Nascimento (Birth Certificate)
 * - Contrato Social (Articles of Incorporation)
 *
 * File Storage:
 * - Local storage: /uploads/requests/{request_id}/{filename}
 * - Cloud storage (future): S3 bucket
 *
 * Security:
 * - Only the user who created the request or assigned accountant can upload
 * - Only authenticated users can download
 * - File size limited to 50MB (enforced by database constraint)
 */
@Entity('request_documents')
export class RequestDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @ManyToOne(() => CompanyRegistrationRequest, { nullable: false })
  @JoinColumn({ name: 'request_id' })
  request: CompanyRegistrationRequest;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({
    name: 'document_type',
    type: 'varchar',
    length: 100,
  })
  documentType: DocumentType;

  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 255,
  })
  fileName: string;

  @Column({
    name: 'file_path',
    type: 'varchar',
    length: 500,
  })
  filePath: string;

  @Column({
    name: 'file_size',
    type: 'integer',
  })
  fileSize: number;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mimeType: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
