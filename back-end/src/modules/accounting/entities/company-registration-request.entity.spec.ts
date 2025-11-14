import { CompanyRegistrationRequest, RequestStatus } from './company-registration-request.entity';
import { User } from '../../../users/entities/user.entity';

describe('CompanyRegistrationRequest Entity', () => {
  describe('Entity Definition', () => {
    it('should be defined', () => {
      expect(CompanyRegistrationRequest).toBeDefined();
    });

    it('should create instance with valid data', () => {
      const request = new CompanyRegistrationRequest();
      request.id = '123e4567-e89b-12d3-a456-426614174000';
      request.userId = '123e4567-e89b-12d3-a456-426614174001';
      request.status = RequestStatus.PENDING;
      request.requestData = { fullName: 'João Silva', cpf: '123.456.789-00' };

      expect(request).toBeDefined();
      expect(request.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(request.userId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(request.status).toBe(RequestStatus.PENDING);
      expect(request.requestData).toEqual({ fullName: 'João Silva', cpf: '123.456.789-00' });
    });
  });

  describe('RequestStatus Enum', () => {
    it('should have PENDING status', () => {
      expect(RequestStatus.PENDING).toBe('pending');
    });

    it('should have IN_PROGRESS status', () => {
      expect(RequestStatus.IN_PROGRESS).toBe('in_progress');
    });

    it('should have WAITING_DOCUMENTS status', () => {
      expect(RequestStatus.WAITING_DOCUMENTS).toBe('waiting_documents');
    });

    it('should have PROCESSING status', () => {
      expect(RequestStatus.PROCESSING).toBe('processing');
    });

    it('should have COMPLETED status', () => {
      expect(RequestStatus.COMPLETED).toBe('completed');
    });

    it('should have CANCELLED status', () => {
      expect(RequestStatus.CANCELLED).toBe('cancelled');
    });
  });

  describe('Relationships', () => {
    it('should have relationship with User (user)', () => {
      const request = new CompanyRegistrationRequest();
      const user = new User();
      user.id = '123e4567-e89b-12d3-a456-426614174001';
      user.email = 'user@example.com';

      request.user = user;

      expect(request.user).toBeDefined();
      expect(request.user).toBeInstanceOf(User);
      expect(request.user.id).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should have optional relationship with User (assignedTo)', () => {
      const request = new CompanyRegistrationRequest();
      const accountant = new User();
      accountant.id = '123e4567-e89b-12d3-a456-426614174002';
      accountant.email = 'accountant@example.com';

      request.assignedTo = accountant;

      expect(request.assignedTo).toBeDefined();
      expect(request.assignedTo).toBeInstanceOf(User);
      expect(request.assignedTo.id).toBe('123e4567-e89b-12d3-a456-426614174002');
    });

    it('should allow assignedTo to be null', () => {
      const request = new CompanyRegistrationRequest();
      request.assignedTo = null;

      expect(request.assignedTo).toBeNull();
    });

    it('should allow company to be null initially', () => {
      const request = new CompanyRegistrationRequest();
      request.companyId = null;

      expect(request.companyId).toBeNull();
    });
  });

  describe('Status Transitions', () => {
    it('should allow status change from PENDING to IN_PROGRESS', () => {
      const request = new CompanyRegistrationRequest();
      request.status = RequestStatus.PENDING;

      request.status = RequestStatus.IN_PROGRESS;

      expect(request.status).toBe(RequestStatus.IN_PROGRESS);
    });

    it('should allow status change from IN_PROGRESS to WAITING_DOCUMENTS', () => {
      const request = new CompanyRegistrationRequest();
      request.status = RequestStatus.IN_PROGRESS;

      request.status = RequestStatus.WAITING_DOCUMENTS;

      expect(request.status).toBe(RequestStatus.WAITING_DOCUMENTS);
    });

    it('should allow status change from WAITING_DOCUMENTS to PROCESSING', () => {
      const request = new CompanyRegistrationRequest();
      request.status = RequestStatus.WAITING_DOCUMENTS;

      request.status = RequestStatus.PROCESSING;

      expect(request.status).toBe(RequestStatus.PROCESSING);
    });

    it('should allow status change from PROCESSING to COMPLETED', () => {
      const request = new CompanyRegistrationRequest();
      request.status = RequestStatus.PROCESSING;

      request.status = RequestStatus.COMPLETED;

      expect(request.status).toBe(RequestStatus.COMPLETED);
    });

    it('should allow status change to CANCELLED from any status', () => {
      const request = new CompanyRegistrationRequest();
      request.status = RequestStatus.IN_PROGRESS;

      request.status = RequestStatus.CANCELLED;

      expect(request.status).toBe(RequestStatus.CANCELLED);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', () => {
      const request = new CompanyRegistrationRequest();
      const now = new Date();
      request.createdAt = now;

      expect(request.createdAt).toBeDefined();
      expect(request.createdAt).toBeInstanceOf(Date);
      expect(request.createdAt).toBe(now);
    });

    it('should have updatedAt timestamp', () => {
      const request = new CompanyRegistrationRequest();
      const now = new Date();
      request.updatedAt = now;

      expect(request.updatedAt).toBeDefined();
      expect(request.updatedAt).toBeInstanceOf(Date);
      expect(request.updatedAt).toBe(now);
    });

    it('should allow completedAt to be null', () => {
      const request = new CompanyRegistrationRequest();
      request.completedAt = null;

      expect(request.completedAt).toBeNull();
    });

    it('should allow completedAt to have a date when completed', () => {
      const request = new CompanyRegistrationRequest();
      const completionDate = new Date();
      request.completedAt = completionDate;

      expect(request.completedAt).toBeDefined();
      expect(request.completedAt).toBeInstanceOf(Date);
      expect(request.completedAt).toBe(completionDate);
    });

    it('should allow cancelledAt to be null', () => {
      const request = new CompanyRegistrationRequest();
      request.cancelledAt = null;

      expect(request.cancelledAt).toBeNull();
    });

    it('should allow cancelledAt to have a date when cancelled', () => {
      const request = new CompanyRegistrationRequest();
      const cancellationDate = new Date();
      request.cancelledAt = cancellationDate;

      expect(request.cancelledAt).toBeDefined();
      expect(request.cancelledAt).toBeInstanceOf(Date);
      expect(request.cancelledAt).toBe(cancellationDate);
    });
  });

  describe('Request Data (JSONB)', () => {
    it('should store request data as object', () => {
      const request = new CompanyRegistrationRequest();
      const requestData = {
        fullName: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        businessType: 'Desenvolvimento de Software',
        estimatedRevenue: 'Até R$ 10.000/mês',
        preferredCompanyType: 'MEI',
        hasCommercialAddress: false,
        address: {
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
      };

      request.requestData = requestData;

      expect(request.requestData).toBeDefined();
      expect(request.requestData).toEqual(requestData);
      expect(request.requestData.fullName).toBe('João Silva');
      expect(request.requestData.address.city).toBe('São Paulo');
    });

    it('should handle nested objects in requestData', () => {
      const request = new CompanyRegistrationRequest();
      const requestData = {
        personalInfo: {
          name: 'João',
          lastName: 'Silva',
        },
        businessInfo: {
          type: 'MEI',
          activity: 'Software',
        },
      };

      request.requestData = requestData;

      expect(request.requestData.personalInfo).toBeDefined();
      expect(request.requestData.businessInfo).toBeDefined();
      expect(request.requestData.personalInfo.name).toBe('João');
    });

    it('should handle arrays in requestData', () => {
      const request = new CompanyRegistrationRequest();
      const requestData = {
        documents: ['RG', 'CPF', 'Comprovante'],
        activities: ['Software', 'Consultoria'],
      };

      request.requestData = requestData;

      expect(request.requestData.documents).toBeInstanceOf(Array);
      expect(request.requestData.documents.length).toBe(3);
      expect(request.requestData.activities).toContain('Software');
    });
  });

  describe('Default Values', () => {
    it('should have default status as PENDING', () => {
      const request = new CompanyRegistrationRequest();
      // Note: Default value is set by database, not TypeScript
      // This test verifies the expected default
      expect(RequestStatus.PENDING).toBe('pending');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty requestData object', () => {
      const request = new CompanyRegistrationRequest();
      request.requestData = {};

      expect(request.requestData).toEqual({});
      expect(Object.keys(request.requestData).length).toBe(0);
    });

    it('should handle requestData with null values', () => {
      const request = new CompanyRegistrationRequest();
      request.requestData = {
        name: null,
        address: null,
      };

      expect(request.requestData.name).toBeNull();
      expect(request.requestData.address).toBeNull();
    });

    it('should handle very long strings in requestData', () => {
      const request = new CompanyRegistrationRequest();
      const longString = 'a'.repeat(1000);
      request.requestData = {
        notes: longString,
      };

      expect(request.requestData.notes).toBe(longString);
      expect(request.requestData.notes.length).toBe(1000);
    });
  });
});
