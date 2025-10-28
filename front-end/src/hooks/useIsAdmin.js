import { useUserStatus } from './useUserStatus';

export const useIsAdmin = () => {
  const { userStatus, loading } = useUserStatus();

  // Allow access to admin and partner_english_course roles
  const allowedRoles = ['admin', 'partner_english_course'];
  const isAdmin = userStatus && !loading ? allowedRoles.includes(userStatus.role) : false;

  return { isAdmin, loading };
};
