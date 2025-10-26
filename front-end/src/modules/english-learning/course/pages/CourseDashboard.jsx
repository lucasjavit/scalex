import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import courseApiService from '../services/courseApi';

export default function CourseDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to load dashboard data...');

      // Load stages (required)
      const stagesData = await courseApiService.getAllStages().catch((err) => {
        console.error('❌ Error loading stages:', err);
        return [];
      });
      console.log('📊 Stages data received:', stagesData);
      console.log('📏 Stages length:', stagesData?.length);
      console.log('📦 Stages type:', typeof stagesData, Array.isArray(stagesData));
      setStages(stagesData || []);
      console.log('✅ Stages set to state');

      // Load dashboard stats (optional - can fail without breaking UI)
      const statsData = await courseApiService.getDashboard().catch((err) => {
        console.warn('Dashboard stats not available:', err.message);
        return null;
      });
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load course data');
      setStages([]); // Ensure stages is always an array
    } finally {
      setLoading(false);
      console.log('🏁 Loading complete');
    }
  };

  const handleStartReview = () => {
    navigate('/learning/course/review');
  };

  const handleStageClick = (stage) => {
    // Only allow navigation if stage is unlocked
    if (stage.isUnlocked) {
      navigate(`/learning/course/stages/${stage.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // Calculate overall course progress
  const totalStages = stages.length;
  const completedStages = stages.filter(stage => stage.isCompleted).length;
  const courseProgress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/learning')}
            className="btn-copilot-secondary flex items-center gap-2"
          >
            <span>←</span>
            <span>{t('common:navigation.back', 'Voltar')}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-copilot-gradient p-4 rounded-copilot-lg mb-6 shadow-copilot-lg">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-5xl">📚</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            English Course
          </h1>

          <p className="text-copilot-text-secondary text-lg mb-6">
            Aprenda inglês com vídeos e flashcards inteligentes
          </p>

          {/* Course Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-copilot-text-primary">Progresso do Curso</h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {completedStages} de {totalStages} estágios completos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-copilot-text-primary">{courseProgress}%</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${courseProgress}%` }}
                ></div>
              </div>

              {courseProgress === 100 && (
                <div className="mt-4 text-center">
                  <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-copilot font-bold text-sm">
                    🎉 Parabéns! Você completou todo o curso!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {dashboardStats?.cardsDue && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
              📊 Suas Estatísticas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Novos Cards"
                value={dashboardStats.cardsDue.new || 0}
                icon="🆕"
                gradient="from-blue-500 to-cyan-500"
              />
              <StatsCard
                title="Em Aprendizado"
                value={dashboardStats.cardsDue.learning || 0}
                icon="📖"
                gradient="from-yellow-500 to-orange-500"
              />
              <StatsCard
                title="Para Revisar"
                value={dashboardStats.cardsDue.review || 0}
                icon="♻️"
                gradient="from-purple-500 to-pink-500"
              />
              <StatsCard
                title="Total Disponível"
                value={dashboardStats.cardsDue.total || 0}
                icon="🎴"
                gradient="from-green-500 to-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Start Review */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-6 mx-auto">
                  <span className="text-white text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-copilot-text-primary mb-3">
                  Revisar Cards
                </h3>
                <p className="text-copilot-text-secondary mb-6">
                  {dashboardStats?.cardsDue?.total
                    ? `Você tem ${dashboardStats.cardsDue.total} cards disponíveis para praticar`
                    : 'Pratique seus flashcards e melhore seu vocabulário'
                  }
                </p>
                <button
                  onClick={handleStartReview}
                  className="btn-copilot-primary text-lg px-8 py-4 w-full"
                >
                  Iniciar Revisão
                </button>
              </div>
            </div>

            {/* Browse Stages */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-copilot flex items-center justify-center mb-6 mx-auto">
                  <span className="text-white text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-copilot-text-primary mb-3">
                  Explorar Curso
                </h3>
                <p className="text-copilot-text-secondary mb-6">
                  Navegue pelos estágios e assista vídeos para aprender novas palavras
                </p>
                <button
                  onClick={() => document.getElementById('stages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-copilot-secondary text-lg px-8 py-4 w-full"
                >
                  Ver Estágios
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stages Section */}
        <div id="stages-section" className="mb-12">
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
            📂 Estágios do Curso
          </h2>
          {console.log('🎨 Rendering stages section. stages.length:', stages.length, 'stages:', stages)}
          {stages.length === 0 ? (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
              <p className="text-copilot-text-secondary text-lg">
                Nenhum estágio disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stages.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  onClick={() => handleStageClick(stage)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
          <h3 className="text-2xl font-bold text-copilot-text-primary mb-6 text-center">
            ✨ Como Funciona
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎥"
              title="Assista Vídeos"
              description="Aprenda com vídeos autênticos em inglês com legendas"
              gradient="from-red-500 to-pink-500"
            />
            <FeatureCard
              icon="🎴"
              title="Pratique com Flashcards"
              description="Sistema de repetição espaçada para memorização efetiva"
              gradient="from-purple-500 to-indigo-500"
            />
            <FeatureCard
              icon="📈"
              title="Acompanhe Progresso"
              description="Veja suas estatísticas e evolução ao longo do tempo"
              gradient="from-green-500 to-teal-500"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon, gradient }) {
  return (
    <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 text-center">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-copilot flex items-center justify-center mb-4 mx-auto`}>
        <span className="text-white text-2xl">{icon}</span>
      </div>
      <h3 className="text-3xl font-bold text-copilot-text-primary mb-1">
        {value}
      </h3>
      <p className="text-copilot-text-secondary text-sm">{title}</p>
    </div>
  );
}

// Stage Card Component
function StageCard({ stage, onClick }) {
  const isLocked = !stage.isUnlocked;
  const isCompleted = stage.isCompleted;

  return (
    <div
      onClick={onClick}
      className={`relative bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot shadow-copilot p-6 transition-all duration-200 ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:border-copilot-accent-primary hover:shadow-copilot-xl group'
      }`}
    >
      {/* Completed Badge */}
      {isCompleted && !isLocked && (
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-copilot text-xs font-bold flex items-center gap-1">
          <span>✓</span>
          <span>Completo</span>
        </div>
      )}

      {/* Lock Icon */}
      {isLocked && (
        <div className="absolute top-3 right-3 text-3xl">
          🔒
        </div>
      )}

      <div className={`w-14 h-14 bg-gradient-to-br ${
        isLocked ? 'from-gray-400 to-gray-500' : 'from-purple-500 to-pink-500'
      } rounded-copilot flex items-center justify-center mb-4 shadow-copilot ${
        !isLocked && 'group-hover:scale-110'
      } transition-transform duration-200`}>
        <span className="text-white text-3xl font-bold">{stage.orderIndex}</span>
      </div>

      <h3 className={`font-bold text-lg mb-2 ${
        isLocked ? 'text-copilot-text-secondary' : 'text-copilot-text-primary'
      }`}>
        {stage.title}
      </h3>

      <p className="text-copilot-text-secondary text-sm mb-4 min-h-[3rem]">
        {stage.description || 'Aprenda habilidades essenciais de inglês'}
      </p>

      {/* Progress Bar */}
      {!isLocked && !isCompleted && stage.totalUnits > 0 && stage.completedUnits > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-copilot-text-secondary mb-1">
            <span>Progresso</span>
            <span>{stage.completedUnits}/{stage.totalUnits} units</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-copilot-gradient h-2 rounded-full transition-all duration-300"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Units Count */}
      {!isLocked && stage.totalUnits > 0 && (
        <div className="mb-4 text-xs text-copilot-text-secondary">
          📹 {stage.totalUnits} {stage.totalUnits === 1 ? 'unit' : 'units'}
        </div>
      )}

      <div className={`flex items-center text-sm font-medium ${
        isLocked ? 'text-gray-400' : 'text-copilot-accent-primary'
      }`}>
        <span>
          {isLocked ? 'Bloqueado' : isCompleted ? 'Revisar' : 'Ver Units'}
        </span>
        {!isLocked && (
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
        )}
      </div>

      {/* Lock Message */}
      {isLocked && (
        <p className="text-xs text-gray-500 mt-2">
          Complete o estágio anterior para desbloquear
        </p>
      )}
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="text-center">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-copilot flex items-center justify-center mb-4 mx-auto`}>
        <span className="text-white text-2xl">{icon}</span>
      </div>
      <h4 className="text-lg font-semibold text-copilot-text-primary mb-2">
        {title}
      </h4>
      <p className="text-copilot-text-secondary text-sm">
        {description}
      </p>
    </div>
  );
}
