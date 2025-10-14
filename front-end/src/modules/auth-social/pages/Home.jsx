import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../../../hooks/useIsAdmin";
import apiService from "../../../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();

  // Check if user has profile data and redirect accordingly
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) return;

      try {
        const existingUser = await apiService.checkUserExists(user.uid);
        if (!existingUser) {
          // User doesn't have profile data, redirect to profile page
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // On error, redirect to profile page to be safe
        navigate('/profile');
      }
    };

    checkUserProfile();
  }, [user, navigate]);

  return (
    <div className="bg-copilot-bg-primary">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          
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


        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* English Course Card */}
          <div 
            className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/english-course')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-2xl">🇬🇧</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">English Course</h3>
            <p className="text-copilot-text-secondary text-sm">
              Aprenda inglês com método interativo e sistema inteligente de repetição espaçada
            </p>
            <div className="mt-4 flex items-center text-copilot-accent-primary text-sm font-medium">
              <span>Começar agora</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </div>

          {/* Video Call Card */}
          <div 
            className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer group"
            onClick={() => navigate('/video-call')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-2xl">🎥</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">Video Call</h3>
            <p className="text-copilot-text-secondary text-sm">
              Pratique inglês com falantes nativos e aprendizes de todo o mundo
            </p>
            <div className="mt-4 flex items-center text-copilot-accent-primary text-sm font-medium">
              <span>Começar agora</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </div>

          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-purple transition-all duration-200 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-copilot flex items-center justify-center mb-4 shadow-copilot">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">Dashboard</h3>
            <p className="text-copilot-text-secondary text-sm">
              Visualize suas estatísticas e métricas em tempo real
            </p>
          </div>

          {/* Admin Panel Card - Only for admins */}
          {isAdmin && (
            <div 
              className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 hover:border-copilot-accent-primary transition-all duration-200 cursor-pointer group"
              onClick={() => navigate('/admin/english-course')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-copilot flex items-center justify-center mb-4 shadow-copilot group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-2xl">👨‍💼</span>
              </div>
              <h3 className="font-bold text-lg mb-2 text-copilot-text-primary">Admin Panel</h3>
              <p className="text-copilot-text-secondary text-sm">
                Gerencie lições, questões e monitore o progresso do curso
              </p>
              <div className="mt-4 flex items-center text-copilot-accent-primary text-sm font-medium">
                <span>Acessar admin</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </div>
          )}
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