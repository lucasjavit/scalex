import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../../components/BackButton';
import courseApiService from '../services/courseApi';

export default function CourseDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

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
      const stagesArray = stagesData || [];
      setStages(stagesArray);
      
      // Find the first stage in progress (unlocked but not completed)
      const inProgressIndex = stagesArray.findIndex(stage => stage.isUnlocked && !stage.isCompleted);
      if (inProgressIndex !== -1) {
        setCurrentIndex(Math.max(0, Math.floor(inProgressIndex / 3)));
      }
      
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

  const handleNext = () => {
    if (carouselRef.current) {
      const maxIndex = stages.length - 3; // Show 3 cards at a time
      setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
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

  // Calculate overall course progress based on completed units
  const totalUnits = stages.reduce((sum, stage) => sum + (stage.totalUnits || 0), 0);
  const completedUnits = stages.reduce((sum, stage) => sum + (stage.completedUnits || 0), 0);
  const courseProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
  
  const completedStages = stages.filter(stage => stage.isCompleted).length;

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <BackButton to="/home" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-2">
            {t('courseDashboard.title')}
          </h1>

          <p className="text-copilot-text-secondary text-lg">
            {t('courseDashboard.subtitle')}
          </p>
        </div>
        
        {/* Course Progress Bar - Alternative Design */}
        <div className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-copilot-xl shadow-xl p-1">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-copilot-lg p-8">
              {/* Background accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-500"></div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-copilot-text-primary">{t('courseDashboard.courseProgress')}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-extrabold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                      {courseProgress}%
                    </div>
                    <p className="text-xs text-copilot-text-secondary font-medium">{t('courseDashboard.completed')}</p>
                  </div>
                </div>

                {/* Progress Bar with Steps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-copilot-text-secondary font-medium">
                      {t('courseDashboard.unitsCompleted', { completed: completedUnits, total: totalUnits })}
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${courseProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                    {/* Progress dots */}
                    <div className="absolute inset-0 flex items-center">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const position = (i + 1) * 10;
                        const isCompleted = courseProgress >= position;
                        return (
                          <div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full ${
                              isCompleted ? 'bg-white' : 'bg-transparent'
                            }`}
                            style={{ left: `${position}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Completion Badge */}
                {courseProgress === 100 && (
                  <div className="mt-6 -mb-2">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-lg font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{t('courseDashboard.courseComplete')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Stats Section */}
        {dashboardStats?.cardsDue && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title={t('courseDashboard.newCards')}
                value={dashboardStats.cardsDue.new || 0}
                icon="🆕"
                gradient="from-blue-500 to-cyan-500"
              />
              <StatsCard
                title={t('courseDashboard.learning')}
                value={dashboardStats.cardsDue.learning || 0}
                icon="📖"
                gradient="from-yellow-500 to-orange-500"
              />
              <StatsCard
                title={t('courseDashboard.toReview')}
                value={dashboardStats.cardsDue.review || 0}
                icon="♻️"
                gradient="from-purple-500 to-pink-500"
              />
              <StatsCard
                title={t('courseDashboard.totalAvailable')}
                value={dashboardStats.cardsDue.total || 0}
                icon="🎴"
                gradient="from-green-500 to-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="mb-12">
          <div className="flex justify-center">
            <button
              onClick={handleStartReview}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 hover:from-orange-500 hover:via-orange-600 hover:to-amber-700 rounded-xl shadow-2xl hover:shadow-[0_20px_25px_-5px_rgba(249,115,22,0.3)] active:shadow-inner active:translate-y-1 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-xl opacity-80"></div>
              <span className="text-3xl relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>⚡</span>
              <span className="relative z-10">{t('courseDashboard.startReview')}</span>
            </button>
          </div>
        </div>

        {/* Stages Section */}
        <div id="stages-section" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-copilot-text-primary">
              {t('courseDashboard.stages')}
            </h2>
            <p className="text-sm text-copilot-text-secondary">
              {stages.length} {stages.length === 1 ? 'estágio' : 'estágios'} disponíveis
            </p>
          </div>
          {console.log('🎨 Rendering stages section. stages.length:', stages.length, 'stages:', stages)}
          {stages.length === 0 ? (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
              <p className="text-copilot-text-secondary text-lg">
                Nenhum estágio disponível no momento.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div 
                  ref={carouselRef}
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
                >
                  {stages.map((stage) => (
                    <div key={stage.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
                      <StageCard
                        stage={stage}
                        onClick={() => handleStageClick(stage)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-full bg-copilot-bg-secondary border border-copilot-border-default shadow-lg hover:shadow-xl hover:border-copilot-accent-primary active:shadow-inner active:translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6 text-copilot-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {stages.slice(0, Math.ceil(stages.length / 3)).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Math.floor(currentIndex) === index
                          ? 'w-8 bg-copilot-accent-primary'
                          : 'w-2 bg-copilot-border-default'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= stages.length - 3}
                  className="p-3 rounded-full bg-copilot-bg-secondary border border-copilot-border-default shadow-lg hover:shadow-xl hover:border-copilot-accent-primary active:shadow-inner active:translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6 text-copilot-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg shadow-lg p-8">
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
      className={`relative rounded-copilot p-6 transition-all duration-300 h-[220px] flex ${
        isLocked
          ? 'opacity-60 cursor-not-allowed bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600'
          : 'cursor-pointer bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-lg hover:shadow-xl hover:from-slate-600 hover:to-slate-700 hover:scale-[1.02] group'
      }`}
    >
      <div className="flex items-start gap-4 flex-1 h-full">
        {/* Stage Number Icon */}
        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br ${
          isLocked ? 'from-gray-400 to-gray-500' : 'from-purple-500 to-indigo-600'
        } rounded-lg flex items-center justify-center shadow-lg ${
          !isLocked && 'group-hover:scale-105'
        } transition-transform duration-200`}>
          <span className="text-white font-bold text-base sm:text-lg">{stage.orderIndex}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full sm:w-auto flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-base sm:text-lg md:text-xl mb-1 break-words line-clamp-2 ${
                isLocked ? 'text-copilot-text-secondary' : 'text-copilot-text-primary'
              }`}>
                {stage.title}
              </h3>
              <p className="text-copilot-text-secondary text-xs sm:text-sm break-words line-clamp-2">
                {stage.description || 'Aprenda habilidades essenciais de inglês'}
              </p>
            </div>

            {/* Status Icons */}
            {isCompleted && !isLocked && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 whitespace-nowrap">
                <span>✅</span>
                <span>Completo</span>
              </div>
            )}
            {isLocked && (
              <span className="text-2xl">🔒</span>
            )}
          </div>

          {/* Progress Bar */}
          {!isLocked && stage.totalUnits > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-copilot-text-secondary">Progresso</span>
                <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-copilot-text-secondary'}`}>
                  {stage.completedUnits}/{stage.totalUnits} units
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-copilot-gradient'
                  }`}
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lock Message */}
      {isLocked && (
        <div className="mt-4 pt-4 border-t border-copilot-border-default">
          <p className="text-xs text-gray-500">
            Complete o estágio anterior para desbloquear
          </p>
        </div>
      )}
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="text-center">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-copilot flex items-center justify-center mb-4 mx-auto`}>
        <span className="text-3xl">{icon}</span>
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
