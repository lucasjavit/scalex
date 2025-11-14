import { RequestDocument, DocumentType } from './request-document.entity';
import { CompanyRegistrationRequest } from './company-registration-request.entity';
import { User } from '../../../users/entities/user.entity';

describe('RequestDocument Entity', () => {
  describe('Entity Definition', () => {
    it('should be defined', () => {
      expect(RequestDocument).toBeDefined();
    });

    it('should create instance with valid data', () => {
      const document = new RequestDocument();
      document.id = '123e4567-e89b-12d3-a456-426614174000';
      document.requestId = '123e4567-e89b-12d3-a456-426614174001';
      document.uploadedBy = '123e4567-e89b-12d3-a456-426614174002';
      document.documentType = DocumentType.CPF;
      document.fileName = 'cpf.pdf';
      document.filePath = '/uploads/documents/cpf.pdf';
      document.fileSize = 1024000;

      expect(document).toBeDefined();
      expect(document.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(document.requestId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(document.uploadedBy).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(document.documentType).toBe(DocumentType.CPF);
      expect(document.fileName).toBe('cpf.pdf');
      expect(document.filePath).toBe('/uploads/documents/cpf.pdf');
      expect(document.fileSize).toBe(1024000);
    });
  });

  describe('DocumentType Enum', () => {
    it('should have RG document type', () => {
      expect(DocumentType.RG).toBe('rg');
    });

    it('should have CPF document type', () => {
      expect(DocumentType.CPF).toBe('cpf');
    });

    it('should have COMPROVANTE_RESIDENCIA document type', () => {
      expect(DocumentType.COMPROVANTE_RESIDENCIA).toBe('comprovante_residencia');
    });

    it('should have CERTIDAO_NASCIMENTO document type', () => {
      expect(DocumentType.CERTIDAO_NASCIMENTO).toBe('certidao_nascimento');
    });

    it('should have CERTIDAO_CASAMENTO document type', () => {
      expect(DocumentType.CERTIDAO_CASAMENTO).toBe('certidao_casamento');
    });

    it('should have TITULO_ELEITOR document type', () => {
      expect(DocumentType.TITULO_ELEITOR).toBe('titulo_eleitor');
    });

    it('should have CONTRATO_SOCIAL document type', () => {
      expect(DocumentType.CONTRATO_SOCIAL).toBe('contrato_social');
    });

    it('should have REQUERIMENTO_MEI document type', () => {
      expect(DocumentType.REQUERIMENTO_MEI).toBe('requerimento_mei');
    });

    it('should have OUTROS document type', () => {
      expect(DocumentType.OUTROS).toBe('outros');
    });
  });

  describe('Relationships', () => {
    it('should have relationship with CompanyRegistrationRequest', () => {
      const document = new RequestDocument();
      const request = new CompanyRegistrationRequest();
      request.id = '123e4567-e89b-12d3-a456-426614174001';

      document.request = request;

      expect(document.request).toBeDefined();
      expect(document.request).toBeInstanceOf(CompanyRegistrationRequest);
      expect(document.request.id).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should have relationship with User (uploader)', () => {
      const document = new RequestDocument();
      const user = new User();
      user.id = '123e4567-e89b-12d3-a456-426614174002';
      user.email = 'user@example.com';

      document.uploader = user;

      expect(document.uploader).toBeDefined();
      expect(document.uploader).toBeInstanceOf(User);
      expect(document.uploader.id).toBe('123e4567-e89b-12d3-a456-426614174002');
    });
  });

  describe('File Properties', () => {
    it('should store file name', () => {
      const document = new RequestDocument();
      document.fileName = 'documento-identidade.pdf';

      expect(document.fileName).toBe('documento-identidade.pdf');
    });

    it('should store file path', () => {
      const document = new RequestDocument();
      document.filePath = '/uploads/requests/123/rg.pdf';

      expect(document.filePath).toBe('/uploads/requests/123/rg.pdf');
    });

    it('should store file size in bytes', () => {
      const document = new RequestDocument();
      document.fileSize = 2048576; // ~2MB

      expect(document.fileSize).toBe(2048576);
    });

    it('should store mime type', () => {
      const document = new RequestDocument();
      document.mimeType = 'application/pdf';

      expect(document.mimeType).toBe('application/pdf');
    });

    it('should allow mimeType to be null', () => {
      const document = new RequestDocument();
      document.mimeType = null;

      expect(document.mimeType).toBeNull();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', () => {
      const document = new RequestDocument();
      const now = new Date();
      document.createdAt = now;

      expect(document.createdAt).toBeDefined();
      expect(document.createdAt).toBeInstanceOf(Date);
      expect(document.createdAt).toBe(now);
    });

    it('should have updatedAt timestamp', () => {
      const document = new RequestDocument();
      const now = new Date();
      document.updatedAt = now;

      expect(document.updatedAt).toBeDefined();
      expect(document.updatedAt).toBeInstanceOf(Date);
      expect(document.updatedAt).toBe(now);
    });
  });

  describe('File Size Validation', () => {
    it('should accept file size within limits (1MB)', () => {
      const document = new RequestDocument();
      document.fileSize = 1048576; // 1MB

      expect(document.fileSize).toBe(1048576);
      expect(document.fileSize).toBeGreaterThan(0);
      expect(document.fileSize).toBeLessThanOrEqual(52428800); // 50MB
    });

    it('should accept file size at maximum limit (50MB)', () => {
      const document = new RequestDocument();
      document.fileSize = 52428800; // 50MB

      expect(document.fileSize).toBe(52428800);
      expect(document.fileSize).toBeLessThanOrEqual(52428800);
    });

    it('should accept small file size (1KB)', () => {
      const document = new RequestDocument();
      document.fileSize = 1024; // 1KB

      expect(document.fileSize).toBe(1024);
      expect(document.fileSize).toBeGreaterThan(0);
    });
  });

  describe('Document Type Validation', () => {
    it('should accept valid document types', () => {
      const validTypes = [
        DocumentType.RG,
        DocumentType.CPF,
        DocumentType.COMPROVANTE_RESIDENCIA,
        DocumentType.CERTIDAO_NASCIMENTO,
        DocumentType.CERTIDAO_CASAMENTO,
        DocumentType.TITULO_ELEITOR,
        DocumentType.CONTRATO_SOCIAL,
        DocumentType.REQUERIMENTO_MEI,
        DocumentType.OUTROS,
      ];

      validTypes.forEach(type => {
        const document = new RequestDocument();
        document.documentType = type;
        expect(document.documentType).toBe(type);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long file names', () => {
      const document = new RequestDocument();
      const longFileName = 'a'.repeat(250) + '.pdf';
      document.fileName = longFileName;

      expect(document.fileName).toBe(longFileName);
      expect(document.fileName.length).toBe(254);
    });

    it('should handle very long file paths', () => {
      const document = new RequestDocument();
      const longPath = '/uploads/' + 'a'.repeat(480) + '/file.pdf';
      document.filePath = longPath;

      expect(document.filePath).toBe(longPath);
      expect(document.filePath.length).toBeLessThanOrEqual(500);
    });

    it('should handle different mime types', () => {
      const document = new RequestDocument();
      const mimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
      ];

      mimeTypes.forEach(mimeType => {
        document.mimeType = mimeType;
        expect(document.mimeType).toBe(mimeType);
      });
    });
  });

  describe('Multiple Documents for Same Request', () => {
    it('should allow multiple documents for same request', () => {
      const request = new CompanyRegistrationRequest();
      request.id = '123e4567-e89b-12d3-a456-426614174001';

      const doc1 = new RequestDocument();
      doc1.id = '123e4567-e89b-12d3-a456-426614174010';
      doc1.requestId = request.id;
      doc1.documentType = DocumentType.CPF;
      doc1.request = request;

      const doc2 = new RequestDocument();
      doc2.id = '123e4567-e89b-12d3-a456-426614174011';
      doc2.requestId = request.id;
      doc2.documentType = DocumentType.RG;
      doc2.request = request;

      expect(doc1.requestId).toBe(doc2.requestId);
      expect(doc1.documentType).not.toBe(doc2.documentType);
    });
  });

  describe('Different File Extensions', () => {
    it('should handle PDF files', () => {
      const document = new RequestDocument();
      document.fileName = 'documento.pdf';
      document.mimeType = 'application/pdf';

      expect(document.fileName.endsWith('.pdf')).toBe(true);
      expect(document.mimeType).toBe('application/pdf');
    });

    it('should handle image files', () => {
      const document = new RequestDocument();
      document.fileName = 'foto.jpg';
      document.mimeType = 'image/jpeg';

      expect(document.fileName.endsWith('.jpg')).toBe(true);
      expect(document.mimeType).toBe('image/jpeg');
    });

    it('should handle PNG files', () => {
      const document = new RequestDocument();
      document.fileName = 'scan.png';
      document.mimeType = 'image/png';

      expect(document.fileName.endsWith('.png')).toBe(true);
      expect(document.mimeType).toBe('image/png');
    });
  });
});
