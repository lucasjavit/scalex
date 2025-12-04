import { useUserStatus } from './useUserStatus';

export const useIsAdmin = () => {
  const { userStatus, loading } = useUserStatus();

  // Admin panel should only be visible for 'admin' role
  const isAdmin = userStatus && !loading ? userStatus.role === 'admin' : false;

  return { isAdmin, loading };
};
