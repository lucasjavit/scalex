import {
  UserRole,
  PartnerRole,
  USER_ROLES,
  isPartnerRole,
  isAdminRole,
  getModuleFromPartnerRole,
  getPartnerRoleFromModule,
  MODULE_TO_PARTNER_ROLE,
  ROLE_DESCRIPTIONS,
} from './user-roles.type';

describe('UserRoles Type System', () => {
  describe('Type Definitions', () => {
    it('should have all 10 roles in USER_ROLES array', () => {
      expect(USER_ROLES).toHaveLength(10);
      expect(USER_ROLES).toEqual([
        'user',
        'admin',
        'partner_english_course',
        'partner_cnpj',
        'partner_remittance',
        'partner_resume',
        'partner_interview',
        'partner_networking',
        'partner_job_marketplace',
        'partner_community',
      ]);
    });

    it('should have descriptions for all roles', () => {
      USER_ROLES.forEach((role) => {
        expect(ROLE_DESCRIPTIONS[role]).toBeDefined();
        expect(typeof ROLE_DESCRIPTIONS[role]).toBe('string');
        expect(ROLE_DESCRIPTIONS[role].length).toBeGreaterThan(0);
      });
    });

    it('should have correct module to partner role mappings', () => {
      expect(MODULE_TO_PARTNER_ROLE).toEqual({
        'english-course': 'partner_english_course',
        cnpj: 'partner_cnpj',
        remittance: 'partner_remittance',
        resume: 'partner_resume',
        interview: 'partner_interview',
        networking: 'partner_networking',
        'job-marketplace': 'partner_job_marketplace',
        community: 'partner_community',
      });
    });
  });

  describe('isPartnerRole()', () => {
    it('should return true for all partner roles', () => {
      const partnerRoles: PartnerRole[] = [
        'partner_english_course',
        'partner_cnpj',
        'partner_remittance',
        'partner_resume',
        'partner_interview',
        'partner_networking',
        'partner_job_marketplace',
        'partner_community',
      ];

      partnerRoles.forEach((role) => {
        expect(isPartnerRole(role)).toBe(true);
      });
    });

    it('should return false for user role', () => {
      expect(isPartnerRole('user' as UserRole)).toBe(false);
    });

    it('should return false for admin role', () => {
      expect(isPartnerRole('admin' as UserRole)).toBe(false);
    });
  });

  describe('isAdminRole()', () => {
    it('should return true for admin role', () => {
      expect(isAdminRole('admin')).toBe(true);
    });

    it('should return false for user role', () => {
      expect(isAdminRole('user')).toBe(false);
    });

    it('should return false for partner roles', () => {
      expect(isAdminRole('partner_english_course')).toBe(false);
      expect(isAdminRole('partner_cnpj')).toBe(false);
      expect(isAdminRole('partner_remittance')).toBe(false);
    });
  });

  describe('getModuleFromPartnerRole()', () => {
    it('should extract module code from partner_english_course', () => {
      expect(getModuleFromPartnerRole('partner_english_course')).toBe(
        'english_course',
      );
    });

    it('should extract module code from partner_cnpj', () => {
      expect(getModuleFromPartnerRole('partner_cnpj')).toBe('cnpj');
    });

    it('should extract module code from partner_remittance', () => {
      expect(getModuleFromPartnerRole('partner_remittance')).toBe('remittance');
    });

    it('should extract module code from partner_resume', () => {
      expect(getModuleFromPartnerRole('partner_resume')).toBe('resume');
    });

    it('should extract module code from partner_interview', () => {
      expect(getModuleFromPartnerRole('partner_interview')).toBe('interview');
    });

    it('should extract module code from partner_networking', () => {
      expect(getModuleFromPartnerRole('partner_networking')).toBe('networking');
    });

    it('should extract module code from partner_job_marketplace', () => {
      expect(getModuleFromPartnerRole('partner_job_marketplace')).toBe(
        'job_marketplace',
      );
    });

    it('should extract module code from partner_community', () => {
      expect(getModuleFromPartnerRole('partner_community')).toBe('community');
    });
  });

  describe('getPartnerRoleFromModule()', () => {
    it('should create partner role from english_course', () => {
      expect(getPartnerRoleFromModule('english_course')).toBe(
        'partner_english_course',
      );
    });

    it('should create partner role from cnpj', () => {
      expect(getPartnerRoleFromModule('cnpj')).toBe('partner_cnpj');
    });

    it('should create partner role from remittance', () => {
      expect(getPartnerRoleFromModule('remittance')).toBe('partner_remittance');
    });

    it('should create partner role from resume', () => {
      expect(getPartnerRoleFromModule('resume')).toBe('partner_resume');
    });

    it('should create partner role from interview', () => {
      expect(getPartnerRoleFromModule('interview')).toBe('partner_interview');
    });

    it('should create partner role from networking', () => {
      expect(getPartnerRoleFromModule('networking')).toBe('partner_networking');
    });

    it('should create partner role from job_marketplace', () => {
      expect(getPartnerRoleFromModule('job_marketplace')).toBe(
        'partner_job_marketplace',
      );
    });

    it('should create partner role from community', () => {
      expect(getPartnerRoleFromModule('community')).toBe('partner_community');
    });
  });

  describe('Integration: Round-trip conversion', () => {
    it('should convert module -> partner role -> module correctly', () => {
      const modules = [
        'english_course',
        'cnpj',
        'remittance',
        'resume',
        'interview',
        'networking',
        'job_marketplace',
        'community',
      ];

      modules.forEach((module) => {
        const partnerRole = getPartnerRoleFromModule(module);
        const extractedModule = getModuleFromPartnerRole(partnerRole);
        expect(extractedModule).toBe(module);
      });
    });
  });
});
