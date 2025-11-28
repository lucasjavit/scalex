import { ModuleType } from '../../modules/messaging/entities/conversation.entity';
import { UserRole } from '../types/user-roles.type';

/**
 * Module Chat Configuration
 *
 * Maps modules to their partner roles and permission fields.
 * Used to automatically filter users and conversations based on module context.
 */

export interface ModuleConfig {
  moduleType: ModuleType;
  partnerRole: UserRole;
  permissionField: string;
  routes: {
    user: string; // User route prefix
    partner: string; // Partner route prefix
  };
}

export const MODULE_CHAT_CONFIG: Record<ModuleType, ModuleConfig> = {
  [ModuleType.ACCOUNTING]: {
    moduleType: ModuleType.ACCOUNTING,
    partnerRole: 'partner_cnpj',
    permissionField: 'businessAccounting',
    routes: {
      user: '/accounting',
      partner: '/accounting/accountant',
    },
  },
  [ModuleType.ENGLISH]: {
    moduleType: ModuleType.ENGLISH,
    partnerRole: 'partner_english_course',
    permissionField: 'learningCourse',
    routes: {
      user: '/learning',
      partner: '/learning/partner',
    },
  },
  [ModuleType.CAREER]: {
    moduleType: ModuleType.CAREER,
    partnerRole: 'partner_resume',
    permissionField: 'businessCareer',
    routes: {
      user: '/career',
      partner: '/career/consultant',
    },
  },
  [ModuleType.JOBS]: {
    moduleType: ModuleType.JOBS,
    partnerRole: 'partner_job_marketplace',
    permissionField: 'businessJobs',
    routes: {
      user: '/jobs',
      partner: '/jobs/partner',
    },
  },
  [ModuleType.INSURANCE]: {
    moduleType: ModuleType.INSURANCE,
    partnerRole: 'partner_community',
    permissionField: 'businessInsurance',
    routes: {
      user: '/insurance',
      partner: '/insurance/broker',
    },
  },
  [ModuleType.BANKING]: {
    moduleType: ModuleType.BANKING,
    partnerRole: 'partner_remittance',
    permissionField: 'businessBanking',
    routes: {
      user: '/banking',
      partner: '/banking/manager',
    },
  },
};

/**
 * Get module config by partner role
 */
export function getModuleByPartnerRole(role: UserRole): ModuleConfig | null {
  return (
    Object.values(MODULE_CHAT_CONFIG).find(
      (config) => config.partnerRole === role,
    ) || null
  );
}

/**
 * Get module config by module type
 */
export function getModuleConfig(moduleType: ModuleType): ModuleConfig {
  return MODULE_CHAT_CONFIG[moduleType];
}

/**
 * Check if a role is a partner role for any module
 */
export function isPartnerForModule(role: UserRole): boolean {
  return Object.values(MODULE_CHAT_CONFIG).some(
    (config) => config.partnerRole === role,
  );
}
