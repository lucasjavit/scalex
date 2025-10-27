import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../../../../components/BackButton';
import courseApiService from '../services/courseApi';

export default function StageView() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { stageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(null);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStageData();
  }, [stageId]);

  const loadStageData = async () => {
    try {
      setLoading(true);
      const [stageData, unitsData] = await Promise.all([
        courseApiService.getStage(stageId),
        courseApiService.getUnitsByStage(stageId),
      ]);
      setStage(stageData);
      setUnits(unitsData);
    } catch (err) {
      console.error('Error loading stage:', err);
      setError('Failed to load stage data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitClick = (unit) => {
    // Only allow navigation if unit is unlocked
    if (unit.isUnlocked) {
      navigate(`/learning/course/units/${unit.id}`);
    }
  };

  const handleStartReview = () => {
    navigate('/learning/course/review');
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

  if (error || !stage) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Stage not found'}</div>
      </div>
    );
  }

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <BackButton to="/learning/course" />

        {/* Stage Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-copilot-gradient w-16 h-16 rounded-copilot flex items-center justify-center text-white text-3xl font-bold shadow-copilot-lg">
                {stage.orderIndex}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-copilot-text-primary">
                  {stage.title}
                </h1>
                <p className="text-copilot-text-secondary text-lg mt-2">
                  {stage.description || 'Learn essential English skills'}
                </p>
              </div>
            </div>
            <button
              onClick={handleStartReview}
              className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 text-base font-bold text-white bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 hover:from-orange-500 hover:via-orange-600 hover:to-amber-700 rounded-xl shadow-2xl hover:shadow-[0_20px_25px_-5px_rgba(249,115,22,0.3)] active:shadow-inner active:translate-y-1 transition-all duration-200 whitespace-nowrap"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-xl opacity-80"></div>
              <span className="text-xl relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>⚡</span>
              <span className="relative z-10">Iniciar Revisão</span>
            </button>
          </div>
        </div>

        {/* Units Section */}
        <div>
          <h2 className="text-2xl font-bold text-copilot-text-primary mb-6">
            📹 Units ({units.length})
          </h2>
          <div className="space-y-4">
            {units.map((unit, index) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                number={index + 1}
                onClick={() => handleUnitClick(unit)}
              />
            ))}
          </div>
          {units.length === 0 && (
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12 text-center">
              <p className="text-copilot-text-secondary text-lg">
                Nenhuma unit disponível neste estágio ainda.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Unit Card Component
function UnitCard({ unit, number, onClick }) {
  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(unit.youtubeUrl);
  const thumbnailUrl = unit.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

  const isLocked = !unit.isUnlocked;
  const isCompleted = unit.isCompleted;

  return (
    <div
      onClick={onClick}
      className={`bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot overflow-hidden transition-all duration-200 ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:border-copilot-accent-primary hover:shadow-copilot-xl group'
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-1/3 relative bg-gray-800">
          {thumbnailUrl ? (
            <div className="relative">
              <img
                src={thumbnailUrl}
                alt={unit.title}
                className={`w-full h-48 md:h-full object-cover ${
                  !isLocked && 'group-hover:scale-105'
                } transition-transform duration-200 ${isLocked && 'filter grayscale'}`}
              />
              {isLocked && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">🔒</span>
                    <p className="text-white font-bold">Bloqueado</p>
                    <p className="text-white text-sm">Complete a unit anterior</p>
                  </div>
                </div>
              )}
              {isCompleted && !isLocked && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-copilot font-bold flex items-center gap-1">
                  <span>✓</span>
                  <span>Completo</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 md:h-full flex items-center justify-center text-white text-6xl relative">
              🎥
              {isLocked && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-2 block">🔒</span>
                    <p className="text-white font-bold">Bloqueado</p>
                    <p className="text-white text-sm">Complete a unit anterior</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-copilot text-white font-bold ${
            isLocked ? 'bg-gray-600' : 'bg-copilot-gradient'
          }`}>
            Unit {number}
          </div>
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-bold text-xl ${isLocked ? 'text-copilot-text-secondary' : 'text-copilot-text-primary'}`}>
              {unit.title}
            </h3>
            {isLocked && (
              <span className="text-2xl">🔒</span>
            )}
          </div>

          <p className="text-copilot-text-secondary text-sm mb-4">
            {unit.description || 'Watch this video to learn more'}
          </p>

          {/* Video Duration */}
          {unit.videoDuration && (
            <div className="flex items-center text-copilot-text-secondary text-sm mb-4">
              <span className="mr-2">⏱️</span>
              <span>{Math.floor(unit.videoDuration / 60)} min</span>
            </div>
          )}

          {/* Progress Bar */}
          {!isLocked && !isCompleted && unit.watchTimeSeconds > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-copilot-text-secondary mb-1">
                <span>Progresso</span>
                <span>{Math.round((unit.watchTimeSeconds / unit.videoDuration) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-copilot-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((unit.watchTimeSeconds / unit.videoDuration) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className={`flex items-center text-sm font-medium ${
            isLocked ? 'text-gray-400' : 'text-copilot-accent-primary'
          }`}>
            <span>{isLocked ? 'Bloqueado' : isCompleted ? 'Assistir Novamente' : 'Assistir Vídeo'}</span>
            {!isLocked && (
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
