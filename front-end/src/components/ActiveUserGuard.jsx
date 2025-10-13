import { useUserStatus } from '../hooks/useUserStatus';
import InactiveUserBlock from './InactiveUserBlock';

const ActiveUserGuard = ({ children }) => {
  const { isActive, isInactive, loading, error } = useUserStatus();

  // Show loading while checking user status
  if (loading) {
    return (
      <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Verificando status da conta...</p>
        </div>
      </div>
    );
  }

  // Show error if there's a problem checking status
  if (error) {
    return (
      <div className="min-h-screen bg-copilot-bg-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg p-8 text-center shadow-copilot-xl">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-copilot-text-primary mb-4">
            Erro de Verificação
          </h1>
          <p className="text-copilot-text-secondary mb-6">
            Não foi possível verificar o status da sua conta. Tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-copilot-accent-primary text-white px-6 py-3 rounded-copilot font-semibold hover:bg-copilot-accent-primary/90 transition-colors duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Block access if user is inactive
  if (isInactive) {
    return <InactiveUserBlock />;
  }

  // Allow access if user is active
  if (isActive) {
    return children;
  }

  // Default case - should not reach here
  return null;
};

export default ActiveUserGuard;
