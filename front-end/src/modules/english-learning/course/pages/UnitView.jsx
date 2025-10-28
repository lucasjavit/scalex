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

      // Start unit progress (optional, don't block UI if it fails)
      try {
        await courseApiService.startUnit(unitId);
      } catch (err) {
        console.warn('Failed to start unit progress:', err);
        // Don't show error to user, just continue
      }

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
      // Skip should complete the unit (same as watching 80%)
      const result = await courseApiService.completeUnit(unitId);
      
      if (result?.cardsCreated) {
        showSuccess(`Unit completada! ${result.cardsCreated} flashcards adicionados ao seu deck.`);
      } else {
        showSuccess('Unit completada com sucesso');
      }
      
      // Set canComplete to show the green border
      setCanComplete(true);
      
      // Navigate to next unit or back to stage
      try {
        // Get all units from the same stage
        const units = await courseApiService.getUnitsByStage(unit.stageId);
        const currentIndex = units.findIndex(u => u.id === unitId);
        const nextUnit = units[currentIndex + 1];
        
        if (nextUnit) {
          // Navigate to next unit
          navigate(`/learning/course/units/${nextUnit.id}`);
        } else {
          // No more units, go back to stage
          navigate(`/learning/course/stages/${unit.stageId}`);
        }
      } catch (navErr) {
        console.error('Error navigating to next unit:', navErr);
      }
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

         {/* Unit Status Badge */}
         {canComplete && (
           <div className="mb-4">
             <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
               <div>
                 <span className="font-bold">Unit Completa!</span>
                 <p className="text-sm opacity-90">Você já completou esta unit anteriormente</p>
               </div>
             </div>
           </div>
         )}

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

         {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkipUnit}
            className="w-full px-6 py-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-700 dark:to-emerald-800 text-green-800 dark:text-green-100 shadow-lg border border-green-300 dark:border-emerald-600 hover:shadow-xl hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-600 dark:hover:to-emerald-700 active:shadow-inner active:translate-y-0.5 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <span>Pular</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
