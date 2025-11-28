import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestDocument, DocumentType } from '../entities/request-document.entity';
import { CompanyRegistrationRequest } from '../entities/company-registration-request.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock fs and path modules BEFORE importing DocumentService
jest.mock('fs');
jest.mock('path', () => {
  const actualPath = jest.requireActual('path');
  return {
    ...actualPath,
    join: jest.fn((...args) => args.join('/')),
    basename: jest.fn((filename) => filename),
  };
});

import { DocumentService } from './document.service';
import * as fs from 'fs';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: Repository<RequestDocument>;
  let requestRepository: Repository<CompanyRegistrationRequest>;

  const mockDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockRequestRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(RequestDocument),
          useValue: mockDocumentRepository,
        },
        {
          provide: getRepositoryToken(CompanyRegistrationRequest),
          useValue: mockRequestRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get<Repository<RequestDocument>>(
      getRepositoryToken(RequestDocument),
    );
    requestRepository = module.get<Repository<CompanyRegistrationRequest>>(
      getRepositoryToken(CompanyRegistrationRequest),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadRequestDocument', () => {
    const mockRequest = {
      id: 'request-123',
      userId: 'user-456',
      assignedToId: 'accountant-789',
    };

    const mockFile = {
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
      size: 1024000, // 1MB
      buffer: Buffer.from('mock file content'),
    } as Express.Multer.File;

    it('should upload document successfully when user is request owner', async () => {
      const mockDocument = {
        id: 'doc-123',
        requestId: 'request-123',
        uploadedBy: 'user-456',
        documentType: 'RG',
        fileName: 'document.pdf',
        filePath: 'uploads/request-documents/request-123/document.pdf',
        fileSize: 1024000,
        createdAt: new Date(),
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      const result = await service.uploadRequestDocument(
        'request-123',
        'user-456',
        mockFile,
        DocumentType.RG,
      );

      expect(mockRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'request-123' },
      });
      expect(result).toEqual(mockDocument);
    });

    it('should upload document successfully when user is assigned accountant', async () => {
      const mockDocument = {
        id: 'doc-123',
        requestId: 'request-123',
        uploadedBy: 'accountant-789',
        documentType: 'CPF',
        fileName: 'document.pdf',
        filePath: 'uploads/request-documents/request-123/document.pdf',
        fileSize: 1024000,
        createdAt: new Date(),
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      const result = await service.uploadRequestDocument(
        'request-123',
        'accountant-789',
        mockFile,
        DocumentType.CPF,
      );

      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadRequestDocument(
          'invalid-request',
          'user-456',
          mockFile,
          DocumentType.RG,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(mockRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invalid-request' },
      });
    });

    it('should throw BadRequestException when user is not authorized', async () => {
      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.uploadRequestDocument(
          'request-123',
          'unauthorized-user',
          mockFile,
          DocumentType.RG,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file is too large', async () => {
      const largeFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // 11MB (exceeds 10MB limit)
      } as Express.Multer.File;

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.uploadRequestDocument(
          'request-123',
          'user-456',
          largeFile,
          DocumentType.RG,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file type is not allowed', async () => {
      const invalidFile = {
        ...mockFile,
        originalname: 'malware.exe',
        mimetype: 'application/x-msdownload',
      } as Express.Multer.File;

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.uploadRequestDocument(
          'request-123',
          'user-456',
          invalidFile,
          DocumentType.RG,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRequestDocuments', () => {
    it('should return all documents for a request', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          requestId: 'request-123',
          documentType: 'RG',
          fileName: 'rg.pdf',
        },
        {
          id: 'doc-2',
          requestId: 'request-123',
          documentType: 'CPF',
          fileName: 'cpf.pdf',
        },
      ];

      mockDocumentRepository.find.mockResolvedValue(mockDocuments);

      const result = await service.getRequestDocuments('request-123');

      expect(mockDocumentRepository.find).toHaveBeenCalledWith({
        where: { requestId: 'request-123' },
        relations: ['uploader'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockDocuments);
    });

    it('should return empty array when no documents exist', async () => {
      mockDocumentRepository.find.mockResolvedValue([]);

      const result = await service.getRequestDocuments('request-123');

      expect(result).toEqual([]);
    });
  });

  describe('deleteDocument', () => {
    const mockDocument = {
      id: 'doc-123',
      requestId: 'request-123',
      uploadedBy: 'user-456',
      filePath: 'uploads/request-documents/request-123/document.pdf',
    };

    it('should delete document successfully when user is uploader', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      await service.deleteDocument('doc-123', 'user-456', 'user');

      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'doc-123' },
      });
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-123');
    });

    it('should throw NotFoundException when document does not exist', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteDocument('invalid-doc', 'user-456', 'user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not uploader', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      await expect(
        service.deleteDocument('doc-123', 'unauthorized-user', 'user'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete document even if file does not exist on disk', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.deleteDocument('doc-123', 'user-456', 'user');

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-123');
    });

    it('should allow accountant (partner_cnpj) to delete any document', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      await service.deleteDocument('doc-123', 'accountant-789', 'partner_cnpj');

      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'doc-123' },
      });
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-123');
    });

    it('should allow admin to delete any document', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      await service.deleteDocument('doc-123', 'admin-999', 'admin');

      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'doc-123' },
      });
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('getDocumentPath', () => {
    it('should return the full file path for a document', async () => {
      const mockDocument = {
        id: 'doc-123',
        filePath: 'uploads/request-documents/request-123/document.pdf',
      };

      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.getDocumentPath('doc-123');

      expect(result).toBe(
        'uploads/request-documents/request-123/document.pdf',
      );
    });

    it('should throw NotFoundException when document does not exist', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(service.getDocumentPath('invalid-doc')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
