import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import BackButton from '../../../../components/BackButton';
import { useNotification } from '../../../../hooks/useNotification';
import courseApiService from '../services/courseApi';

export default function UnitView() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { unitId } = useParams();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(null);
  const [error, setError] = useState(null);
  const [watchTime, setWatchTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const playerRef = useRef(null);
  const watchTimeIntervalRef = useRef(null);
  const hasCompletedRef = useRef(false); // Flag para evitar múltiplas chamadas

  const COMPLETION_THRESHOLD = 0.8; // 80%

  useEffect(() => {
    loadUnitData();

    return () => {
      // Cleanup interval on unmount
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
      }
    };
  }, [unitId]);

  const loadUnitData = async () => {
    try {
      setLoading(true);
      const unitData = await courseApiService.getUnit(unitId);
      setUnit(unitData);

      // Start unit progress
      await courseApiService.startUnit(unitId);

      // Check if unit is already completed
      try {
        const progress = await courseApiService.getUnitProgress(unitId);
        if (progress?.isCompleted) {
          setCanComplete(true);
        }
      } catch (err) {
        // Progress might not exist yet, that's okay
      }
    } catch (err) {
      console.error('Error loading unit:', err);
      setError('Failed to load unit data');
    } finally {
      setLoading(false);
    }
  };

  const handleReady = (event) => {
    playerRef.current = event.target;
    
    // Start tracking after a small delay to ensure player is fully ready
    setTimeout(() => {
      startWatchTimeTracking();
    }, 500);
  };

  const startWatchTimeTracking = () => {
    watchTimeIntervalRef.current = setInterval(async () => {
      if (!playerRef.current) {
        return;
      }

      try {
        // Get actual current time from YouTube player
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        const duration = Math.floor(playerRef.current.getDuration());

        if (isNaN(currentTime) || isNaN(duration) || duration === 0) {
          return;
        }

        setWatchTime(currentTime);
        setVideoDuration(duration);

        // Check if reached 80% and auto-complete
        const requiredTime = Math.floor(duration * COMPLETION_THRESHOLD);

        if (currentTime >= requiredTime && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setCanComplete(true);

          // Para o tracking
          clearInterval(watchTimeIntervalRef.current);

          // Completa a unit automaticamente
          try {
            const result = await courseApiService.completeUnit(unitId);
            showSuccess(
              `Unit completada! ${result.cardsCreated} novos cards foram adicionados ao seu deck de revisão.`,
              { title: 'Parabéns!' }
            );
          } catch (err) {
            showError(err.message || 'Erro ao completar unit');
            hasCompletedRef.current = false;
          }
        }
      } catch (error) {
        // Silently handle player errors
      }
    }, 1000);
  };

  const handleCompleteUnit = async () => {
    try {
      // First, ensure the current watch time is saved
      if (playerRef.current && watchTime > 0) {
        await courseApiService.updateWatchTime(unitId, watchTime);
      }
      
      // Then try to complete the unit
      const result = await courseApiService.completeUnit(unitId);
      showSuccess(
        `Unit completada! ${result.cardsCreated} novos cards foram adicionados.`,
        { title: 'Parabéns!' }
      );
    } catch (err) {
      showError(err.message || 'Erro ao completar unit');
    }
  };

  const handleSkipUnit = async () => {
    try {
      await courseApiService.skipUnit(unitId);
      showSuccess('Unit pulada com sucesso');
    } catch (err) {
      showError(err.message || 'Erro ao pular unit');
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]+)/);
    return match ? match[1] : null;
  };

  const videoId = unit ? getYouTubeId(unit.youtubeUrl) : null;

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      enablejsapi: 1,
    },
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

  if (error || !unit) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Unit not found'}</div>
      </div>
    );
  }

  const requiredTime = videoDuration * COMPLETION_THRESHOLD;

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <BackButton />

        {/* Unit Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-2">
            {unit.title}
          </h1>
          <p className="text-copilot-text-secondary">
            {unit.description || 'Watch this video to learn more'}
          </p>
        </div>

         {/* Video Player */}
          <div className={`bg-copilot-bg-secondary rounded-copilot mb-8 p-4 transition-all duration-500 ${
            canComplete ? 'border-4 border-green-500' : 'border border-copilot-border-default'
          }`}>
           {videoId ? (
             <div className="w-full" style={{ aspectRatio: '16/9' }}>
               <YouTube
                 videoId={videoId}
                 opts={opts}
                 onReady={handleReady}
                 className="w-full h-full"
               />
             </div>
           ) : (
             <div className="aspect-video flex items-center justify-center bg-gray-800 text-white text-6xl">
               🎥
             </div>
           )}
         </div>

         {/* Progress Bar */}
         {videoDuration > 0 && (
           <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6 mb-6">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-3">
                 <span className="text-xl">🎯</span>
                 <div className="text-left">
                   <h3 className="text-lg font-bold text-copilot-text-primary">Progresso do Vídeo</h3>
                   <p className="text-sm text-copilot-text-secondary">
                     {Math.round((watchTime / videoDuration) * 100)}% assistido de {Math.ceil(videoDuration)}s
                   </p>
                 </div>
               </div>
             </div>

             <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
               <div
                 className={`h-4 rounded-full transition-all duration-500 ease-out ${
                   canComplete 
                     ? 'bg-gradient-to-r from-green-500 via-green-400 to-green-500' 
                     : 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500'
                 }`}
                 style={{ width: `${Math.min((watchTime / videoDuration) * 100, 100)}%` }}
               ></div>
             </div>

             {canComplete && (
               <div className="mt-4 text-center">
                 <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-copilot font-bold text-sm">
                   ✅ Unit completada automaticamente!
                 </span>
               </div>
             )}
           </div>
         )}

         {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkipUnit}
            className="w-full px-6 py-4 bg-copilot-bg-secondary border border-copilot-border-default text-copilot-text-secondary rounded-copilot font-bold hover:border-copilot-accent-primary transition-all"
          >
            Pular
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-copilot p-6">
          <h4 className="font-bold text-blue-400 mb-2">💡 Como funciona?</h4>
          <ul className="text-copilot-text-secondary text-sm space-y-1">
            <li>• Assista pelo menos 80% do vídeo</li>
            <li>• Complete a unit para receber os flashcards</li>
            <li>• Os cards irão para seu deck de revisão</li>
            <li>• Revise regularmente para memorizar o conteúdo</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
