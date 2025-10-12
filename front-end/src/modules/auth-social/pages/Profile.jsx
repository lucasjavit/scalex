import LogoutButton from "../components/LogoutButton";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-copilot-bg-primary">
      {/* Header */}
      <header className="bg-copilot-bg-secondary border-b border-copilot-border-default sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-copilot-gradient rounded-copilot"></div>
            <h1 className="text-xl font-bold text-copilot-text-primary">ScaleX</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Card */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg shadow-copilot-xl overflow-hidden">
          {/* Cover gradient */}
          <div className="h-32 bg-copilot-gradient"></div>

          {/* Profile info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-32 h-32 rounded-full border-4 border-copilot-bg-secondary shadow-copilot-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-copilot-gradient rounded-full border-4 border-copilot-bg-secondary shadow-copilot-lg flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-copilot-accent-success rounded-full border-2 border-copilot-bg-secondary"></div>
              </div>

              {/* User info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-copilot-text-primary mb-1">
                  {user.displayName || "Usuário"}
                </h2>
                <p className="text-copilot-text-secondary mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-copilot-accent-primary bg-opacity-10 text-copilot-accent-primary text-xs font-semibold rounded-copilot border border-copilot-accent-primary border-opacity-20">
                    Membro Ativo
                  </span>
                  <span className="px-3 py-1 bg-copilot-accent-success bg-opacity-10 text-copilot-accent-success text-xs font-semibold rounded-copilot border border-copilot-accent-success border-opacity-20">
                    Verificado
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 pt-6 border-t border-copilot-border-default">
              <div className="text-center">
                <div className="text-2xl font-bold text-copilot-text-primary mb-1">127</div>
                <div className="text-sm text-copilot-text-secondary">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-copilot-text-primary mb-1">1.4k</div>
                <div className="text-sm text-copilot-text-secondary">Contribuições</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-copilot-text-primary mb-1">89%</div>
                <div className="text-sm text-copilot-text-secondary">Taxa de Sucesso</div>
              </div>
            </div>

            {/* Details section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                Informações da Conta
              </h3>

              <div className="bg-copilot-bg-tertiary rounded-copilot p-4 border border-copilot-border-subtle">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-copilot-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-copilot-text-secondary">Email</span>
                </div>
                <p className="text-copilot-text-primary pl-8">{user.email}</p>
              </div>

              {user.metadata?.creationTime && (
                <div className="bg-copilot-bg-tertiary rounded-copilot p-4 border border-copilot-border-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-copilot-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-copilot-text-secondary">Membro desde</span>
                  </div>
                  <p className="text-copilot-text-primary pl-8">
                    {new Date(user.metadata.creationTime).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {user.metadata?.lastSignInTime && (
                <div className="bg-copilot-bg-tertiary rounded-copilot p-4 border border-copilot-border-subtle">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-copilot-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-copilot-text-secondary">Último acesso</span>
                  </div>
                  <p className="text-copilot-text-primary pl-8">
                    {new Date(user.metadata.lastSignInTime).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity section */}
        <div className="mt-8 bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot-lg shadow-copilot p-6">
          <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
            Atividade Recente
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-copilot-bg-tertiary rounded-copilot border border-copilot-border-subtle hover:border-copilot-border-focus transition-all duration-200"
              >
                <div className="w-10 h-10 bg-copilot-gradient rounded-copilot flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="flex-1">
                  <p className="text-copilot-text-primary text-sm font-medium">
                    Projeto atualizado com sucesso
                  </p>
                  <p className="text-copilot-text-tertiary text-xs">Há {i} hora{i > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
