import { useUserStatus } from './useUserStatus';

export const useIsAdmin = () => {
  const { userStatus, loading } = useUserStatus();

  // Admin panel should be visible for all roles EXCEPT 'user'
  const isAdmin = userStatus && !loading ? userStatus.role !== 'user' : false;

  return { isAdmin, loading };
};
