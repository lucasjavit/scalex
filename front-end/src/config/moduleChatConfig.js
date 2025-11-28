/**
 * Module Chat Configuration
 *
 * Maps routes to modules and their partner roles
 */

export const MODULE_TYPES = {
  ACCOUNTING: 'accounting',
  ENGLISH: 'english',
  CAREER: 'career',
  JOBS: 'jobs',
  INSURANCE: 'insurance',
  BANKING: 'banking',
};

export const MODULE_CONFIG = {
  [MODULE_TYPES.ACCOUNTING]: {
    moduleType: MODULE_TYPES.ACCOUNTING,
    partnerRole: 'partner_cnpj',
    permissionField: 'businessAccounting',
    routes: {
      user: '/accounting',
      partner: '/accounting/accountant',
    },
    colors: {
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-600',
    },
  },
  [MODULE_TYPES.ENGLISH]: {
    moduleType: MODULE_TYPES.ENGLISH,
    partnerRole: 'partner_english_course',
    permissionField: 'learningCourse',
    routes: {
      user: '/learning',
      partner: '/learning/partner',
    },
    colors: {
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-600',
    },
  },
  [MODULE_TYPES.CAREER]: {
    moduleType: MODULE_TYPES.CAREER,
    partnerRole: 'partner_resume',
    permissionField: 'businessCareer',
    routes: {
      user: '/career',
      partner: '/career/consultant',
    },
    colors: {
      button: 'bg-green-600 hover:bg-green-700',
      badge: 'bg-green-600',
    },
  },
  [MODULE_TYPES.JOBS]: {
    moduleType: MODULE_TYPES.JOBS,
    partnerRole: 'partner_job_marketplace',
    permissionField: 'businessJobs',
    routes: {
      user: '/jobs',
      partner: '/jobs/partner',
    },
    colors: {
      button: 'bg-orange-600 hover:bg-orange-700',
      badge: 'bg-orange-600',
    },
  },
};

/**
 * Get module config from route
 * Note: Partner routes must be checked first since they're more specific
 * (e.g., /accounting/accountant starts with /accounting)
 */
export function getModuleFromRoute(pathname) {
  // First check partner routes (more specific)
  for (const config of Object.values(MODULE_CONFIG)) {
    if (pathname.startsWith(config.routes.partner)) {
      return config;
    }
  }
  // Then check user routes
  for (const config of Object.values(MODULE_CONFIG)) {
    if (pathname.startsWith(config.routes.user)) {
      return config;
    }
  }
  return null;
}

/**
 * Check if user has permission for module
 */
export function hasModulePermission(moduleConfig, userPermissions) {
  if (!moduleConfig || !userPermissions) return false;
  return userPermissions[moduleConfig.permissionField] === true;
}

/**
 * Check if user is partner for module
 */
export function isPartnerForModule(moduleConfig, userRole) {
  if (!moduleConfig) return false;
  return userRole === moduleConfig.partnerRole || userRole === 'admin';
}
