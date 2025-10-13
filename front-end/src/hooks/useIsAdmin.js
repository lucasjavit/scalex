import { useAuth } from '../modules/auth-social/context/AuthContext';

export const useIsAdmin = () => {
  const { user } = useAuth();

  // Admin emails list
  const adminEmails = [
    'admin@scalex.com',
    'lucas@scalex.com',
    'vyeiralucas@gmail.com',
    // Add more admin emails as needed
  ];

  const isAdmin = user ? adminEmails.includes(user.email) : false;

  return { isAdmin };
};
