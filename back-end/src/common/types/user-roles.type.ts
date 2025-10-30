/**
 * User Roles Type System
 *
 * Defines all available user roles in the system.
 * Each module can have its own dedicated partner role.
 */

// Base roles
export type BaseRole = 'user' | 'admin';

// Partner roles - one for each module
export type PartnerRole =
  | 'partner_english_course' // Partner: Curso de Inglês
  | 'partner_cnpj' // Partner: Abertura de CNPJ
  | 'partner_remittance' // Partner: Remessas Internacionais
  | 'partner_resume' // Partner: Currículo Internacional
  | 'partner_interview' // Partner: Simulação de Entrevistas
  | 'partner_networking' // Partner: Networking/LinkedIn
  | 'partner_job_marketplace' // Partner: Marketplace de Vagas
  | 'partner_community'; // Partner: Comunidade Premium

// All roles combined
export type UserRole = BaseRole | PartnerRole;

// Role enum values (for TypeORM)
export const USER_ROLES = [
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
] as const;

// Helper functions
export const isPartnerRole = (role: UserRole): role is PartnerRole => {
  return role.startsWith('partner_');
};

export const isAdminRole = (role: UserRole): boolean => {
  return role === 'admin';
};

export const getModuleFromPartnerRole = (role: PartnerRole): string => {
  return role.replace('partner_', '');
};

export const getPartnerRoleFromModule = (moduleCode: string): PartnerRole => {
  return `partner_${moduleCode}` as PartnerRole;
};

// Module codes mapped to partner roles
export const MODULE_TO_PARTNER_ROLE: Record<string, PartnerRole> = {
  'english-course': 'partner_english_course',
  cnpj: 'partner_cnpj',
  remittance: 'partner_remittance',
  resume: 'partner_resume',
  interview: 'partner_interview',
  networking: 'partner_networking',
  'job-marketplace': 'partner_job_marketplace',
  community: 'partner_community',
};

// Partner role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  user: 'Regular user with access to purchased modules',
  admin: 'Platform administrator with full access',
  partner_english_course: 'Partner responsible for English Course module',
  partner_cnpj: 'Partner responsible for CNPJ Registration module',
  partner_remittance: 'Partner responsible for International Remittance module',
  partner_resume: 'Partner responsible for International Resume module',
  partner_interview: 'Partner responsible for Interview Simulation module',
  partner_networking: 'Partner responsible for Networking/LinkedIn module',
  partner_job_marketplace: 'Partner responsible for Job Marketplace module',
  partner_community: 'Partner responsible for Premium Community module',
};
