import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStatus } from '../../../hooks/useUserStatus';
import { useAuth } from '../../auth-social/context/AuthContext';

const AdminGuard = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isActive, isInactive, loading: userStatusLoading, error: userStatusError } = useUserStatus();

  useEffect(() => {
    checkAdminAccess();
  }, [user, isActive, isInactive, userStatusLoading]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    // Wait for user status to load
    if (userStatusLoading) {
      return;
    }

    // Check if user is active
    if (isInactive) {
      navigate('/home');
      return;
    }

    // For now, we'll use a simple email check
    // In a real app, you'd check against a user role or permission system
    const adminEmails = [
      'admin@scalex.com',
      'lucas@scalex.com',
      'vyeiralucas@gmail.com',
      // Add more admin emails as needed
    ];

    const hasAdminAccess = adminEmails.includes(user.email);
    
    if (!hasAdminAccess) {
      navigate('/home');
      return;
    }

    setIsAdmin(true);
    setIsLoading(false);
  };

  if (isLoading || userStatusLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (userStatusError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-2">
            Erro de Verificação
          </h2>
          <p className="text-copilot-text-secondary mb-6">
            Não foi possível verificar suas permissões. Tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-2">
            Acesso Negado
          </h2>
          <p className="text-copilot-text-secondary mb-6">
            Você não tem permissão para acessar esta área administrativa.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot hover:bg-copilot-accent-primary/90 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGuard;
