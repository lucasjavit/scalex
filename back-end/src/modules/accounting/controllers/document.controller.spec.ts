import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from '../services/document.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  const mockService = {
    uploadRequestDocument: jest.fn(),
    getRequestDocuments: jest.fn(),
    deleteDocument: jest.fn(),
    getDocumentPath: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(
        require('../../../common/guards/firebase-auth.guard').FirebaseAuthGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadDocument', () => {
    const mockFile = {
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
      size: 1024000,
      buffer: Buffer.from('mock file content'),
    } as Express.Multer.File;

    const uploadDto: UploadDocumentDto = {
      requestId: 'request-123',
      documentType: 'RG',
    };

    it('should upload document successfully', async () => {
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

      const req = { user: { id: 'user-456' } };
      mockService.uploadRequestDocument.mockResolvedValue(mockDocument);

      const result = await controller.uploadDocument(req, mockFile, uploadDto);

      expect(service.uploadRequestDocument).toHaveBeenCalledWith(
        'request-123',
        'user-456',
        mockFile,
        'RG',
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw error when no file is provided', async () => {
      const req = { user: { id: 'user-456' } };

      await expect(
        controller.uploadDocument(req, undefined, uploadDto),
      ).rejects.toThrow();
    });
  });

  describe('getRequestDocuments', () => {
    it('should return documents for a request', async () => {
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

      mockService.getRequestDocuments.mockResolvedValue(mockDocuments);

      const result = await controller.getRequestDocuments('request-123');

      expect(service.getRequestDocuments).toHaveBeenCalledWith('request-123');
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const req = { user: { id: 'user-456' } };
      mockService.deleteDocument.mockResolvedValue(undefined);

      await controller.deleteDocument('doc-123', req);

      expect(service.deleteDocument).toHaveBeenCalledWith('doc-123', 'user-456');
    });
  });

  describe('downloadDocument', () => {
    it('should return file path for download', async () => {
      const mockFilePath = 'uploads/request-documents/request-123/document.pdf';
      mockService.getDocumentPath.mockResolvedValue(mockFilePath);

      const result = await controller.downloadDocument('doc-123');

      expect(service.getDocumentPath).toHaveBeenCalledWith('doc-123');
      expect(result).toEqual({ filePath: mockFilePath });
    });
  });
});
