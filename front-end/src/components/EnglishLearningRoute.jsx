import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUserStatus } from '../hooks/useUserStatus';
import { useAuth } from '../modules/auth-social/context/AuthContext';

/**
 * Componente de rota protegida para English Learning
 * Apenas usuários com roles permitidos podem acessar:
 * - user
 * - partner_english_course
 * - admin
 */
const EnglishLearningRoute = ({ children }) => {
  const { user } = useAuth();
  const { userStatus, loading: statusLoading, error: statusError } = useUserStatus();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Aguarda carregar status/role do usuário
      if (statusLoading) {
        return;
      }

      const allowedRoles = ['user', 'partner_english_course', 'admin'];
      const role = userStatus?.role;

      if (!role) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(allowedRoles.includes(role));
      setLoading(false);
    };

    checkAccess();
  }, [user, userStatus, statusLoading]);

  // Aguardando verificação
  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Não tem acesso ao módulo
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar o módulo English Learning.
            Entre em contato com o suporte para obter acesso.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Tem acesso - mostrar conteúdo
  return children;
};

export default EnglishLearningRoute;
