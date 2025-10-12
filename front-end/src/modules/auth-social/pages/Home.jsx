import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-copilot-bg-primary">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-5xl">🏠</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            Bem-vindo de volta
            {user?.displayName && (
              <span className="bg-copilot-gradient bg-clip-text text-transparent">
                , {user.displayName}
              </span>
            )}!
          </h1>
          
          <p className="text-copilot-text-secondary text-lg">
            Explore suas funcionalidades e aproveite ao máximo
          </p>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-16 h-16 rounded-full border-2 border-copilot-accent-primary"
                />
              ) : (
                <div className="w-16 h-16 bg-copilot-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-copilot-text-primary">
                  {user.displayName || "Usuário"}
                </h3>
                <p className="text-copilot-text-secondary">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-purple transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-copilot flex items-center justify-center mb-4 shadow-copilot">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">Dashboard</h3>
            <p className="text-copilot-text-secondary text-sm">
              Visualize suas estatísticas e métricas em tempo real
            </p>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-blue transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot">
              <span className="text-white text-2xl">⚙️</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">Configurações</h3>
            <p className="text-copilot-text-secondary text-sm">
              Personalize sua experiência e preferências
            </p>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-success transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot">
              <span className="text-white text-2xl">📝</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">Projetos</h3>
            <p className="text-copilot-text-secondary text-sm">
              Gerencie e acompanhe seus projetos
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-copilot-gradient rounded-copilot-lg p-8 text-center shadow-copilot-xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            Pronto para começar?
          </h3>
          <p className="text-white text-opacity-90 mb-6">
            Explore todas as funcionalidades disponíveis
          </p>
          <button className="bg-white text-copilot-bg-primary px-8 py-3 rounded-copilot font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-copilot-lg">
            Explorar agora
          </button>
        </div>
      </main>
    </div>
  );
}