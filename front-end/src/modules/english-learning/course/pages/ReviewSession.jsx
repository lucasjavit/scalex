import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../hooks/useNotification';
import courseApiService from '../services/courseApi';

export default function ReviewSession() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showConfirmation } = useNotification();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    wrong: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [startTime, setStartTime] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    loadCards();
  }, []);

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = useCallback((text, language = 'en-US') => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.75;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;

        // Selecionar melhor voz
        let selectedVoice = null;
        if (voices.length > 0) {
          const languageCode = language.split('-')[0];
          selectedVoice = voices.find(voice =>
            voice.lang.startsWith(languageCode) &&
            (voice.name.includes('Google') || voice.name.includes('Microsoft'))
          ) || voices.find(voice =>
            voice.lang.startsWith(languageCode)
          );

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthesis.speak(utterance);
      }, 100);
    }
  }, [voices]);

  // Tocar áudio automaticamente quando carrega uma nova pergunta
  useEffect(() => {
    if (cards.length > 0 && !showAnswer && voices.length > 0) {
      const currentCard = cards[currentCardIndex];
      if (currentCard?.card?.question) {
        const timer = setTimeout(() => {
          speakText(currentCard.card.question, 'en-US');
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [currentCardIndex, cards, showAnswer, voices.length, speakText]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const dueCardsData = await courseApiService.getDueCards(20);

      if (!dueCardsData || !Array.isArray(dueCardsData) || dueCardsData.length === 0) {
        setSessionComplete(true);
        setLoading(false);
        return;
      }

      setCards(dueCardsData);
      setStartTime(Date.now());
    } catch (err) {
      console.error('❌ Error loading cards:', err);
      setTimeout(() => navigate('/learning/course'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const currentCard = cards[currentCardIndex];
      if (showAnswer) {
        speakText(currentCard.card.answer, 'pt-BR');
      } else {
        speakText(currentCard.card.question, 'en-US');
      }
    }
  };

  const handleSubmitReview = async (result) => {
    const currentCard = cards[currentCardIndex];
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      await courseApiService.submitReview(currentCard.card.id, result, timeTaken);

      setSessionStats((prev) => ({
        ...prev,
        [result]: prev[result] + 1,
      }));

      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        setSessionComplete(true);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copilot-accent-primary mx-auto mb-4"></div>
          <p className="text-copilot-text-secondary">Carregando cards...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return <SessionComplete stats={sessionStats} navigate={navigate} totalCards={cards.length} />;
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/learning/course')}
              className="btn-copilot-secondary flex items-center gap-2"
            >
              <span>←</span>
              <span>Voltar</span>
            </button>
            <div className="h-8 w-px bg-copilot-border-default"></div>
            <div>
              <h1 className="text-2xl font-bold text-copilot-text-primary">Sessão de Revisão</h1>
              <p className="text-copilot-text-secondary text-sm">Revisando seus cards</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full border border-yellow-200">
              Card {currentCardIndex + 1} de {cards.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-copilot-text-primary">Progresso da Revisão</span>
            <span className="text-sm text-copilot-text-secondary">
              {Math.round(progress)}% Completo
            </span>
          </div>
          <div className="w-full bg-copilot-border-default rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Review Info */}
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="text-copilot-text-secondary">
              Este card foi revisado <span className="font-semibold text-copilot-text-primary">{currentCard.reviewCount || 0}</span> vezes
            </div>
            {currentCard.lastReviewedAt && (
              <div className="text-copilot-text-secondary">
                Última revisão: <span className="font-semibold text-copilot-text-primary">
                  {new Date(currentCard.lastReviewedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card with 3D Flip */}
        <style>{`
          .card-container {
            transform-style: preserve-3d;
            perspective: 1000px;
            transition: transform 0.7s ease-in-out;
          }

          .card-container.flipped {
            transform: rotateY(180deg);
          }

          .card-face {
            backface-visibility: hidden;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .card-front {
            transform: rotateY(0deg);
          }

          .card-back {
            transform: rotateY(180deg);
          }
        `}</style>

        <div
          className={`card-container relative w-full h-64 cursor-pointer mb-6 ${
            showAnswer ? 'flipped' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front of card (Question) */}
          <div className="card-face card-front">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot-lg shadow-copilot-xl h-full flex items-center justify-center p-6 relative">
              <div className="text-center text-white">
                <p className="text-2xl leading-relaxed px-2">
                  {currentCard.card.question}
                </p>
                <div className="mt-4 text-sm opacity-80">
                  Clique para ver a resposta
                </div>
              </div>

              {/* Audio button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleSpeak}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                  title={isSpeaking ? 'Parar áudio' : 'Tocar áudio'}
                >
                  {isSpeaking ? (
                    <span className="text-white text-lg animate-pulse">⏹️</span>
                  ) : (
                    <span className="text-white text-lg group-hover:scale-110 transition-transform duration-200">🔊</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Back of card (Answer) */}
          <div className="card-face card-back">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-copilot-lg shadow-copilot-xl h-full flex items-center justify-center p-6 relative">
              <div className="text-center text-white">
                <div className="mb-4">
                  <p className="text-2xl leading-relaxed px-2 font-semibold">
                    {currentCard.card.answer}
                  </p>
                </div>

                {currentCard.card.exampleSentence && (
                  <div className="mt-4">
                    <p className="text-lg italic opacity-90">
                      "{currentCard.card.exampleSentence}"
                    </p>
                  </div>
                )}

                <div className="mt-4 text-sm opacity-80">
                  Clique para ver a pergunta novamente
                </div>
              </div>

              {/* Audio button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleSpeak}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                  title={isSpeaking ? 'Parar áudio' : 'Tocar áudio'}
                >
                  {isSpeaking ? (
                    <span className="text-white text-lg animate-pulse">⏹️</span>
                  ) : (
                    <span className="text-white text-lg group-hover:scale-110 transition-transform duration-200">🔊</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Buttons - only show when answer is visible */}
        {showAnswer && (
          <div className="space-y-4">
            <h4 className="text-center text-copilot-text-primary font-semibold mb-4">
              Quão difícil foi este card?
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSubmitReview('wrong')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 flex flex-col items-center"
              >
                <span className="font-bold">De novo</span>
                <span className="text-xs opacity-90">&lt;1 min</span>
              </button>

              <button
                onClick={() => handleSubmitReview('hard')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 flex flex-col items-center"
              >
                <span className="font-bold">Difícil</span>
                <span className="text-xs opacity-90">&lt;10 min</span>
              </button>

              <button
                onClick={() => handleSubmitReview('good')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 flex flex-col items-center"
              >
                <span className="font-bold">Bom</span>
                <span className="text-xs opacity-90">1 dia</span>
              </button>

              <button
                onClick={() => handleSubmitReview('easy')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 flex flex-col items-center"
              >
                <span className="font-bold">Fácil</span>
                <span className="text-xs opacity-90">5 dias</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Session Complete Component
function SessionComplete({ stats, navigate, totalCards }) {
  const total = stats.wrong + stats.hard + stats.good + stats.easy;

  return (
    <div className="bg-copilot-bg-primary min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full mx-6">
        <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-copilot flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-3xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-copilot-text-primary mb-4">
            Sessão Completa!
          </h1>
          <p className="text-copilot-text-secondary text-lg mb-8">
            {totalCards === 0
              ? 'Você não tem cards disponíveis para revisar no momento.'
              : `Você revisou ${total} cards! Seu progresso foi salvo.`
            }
          </p>

          {totalCards > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatBox label="De novo" value={stats.wrong} color="bg-red-500" />
              <StatBox label="Difícil" value={stats.hard} color="bg-orange-500" />
              <StatBox label="Bom" value={stats.good} color="bg-green-500" />
              <StatBox label="Fácil" value={stats.easy} color="bg-blue-500" />
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-copilot-gradient text-white rounded-copilot font-bold hover:opacity-90 transition-opacity"
            >
              Revisar Mais
            </button>
            <button
              onClick={() => navigate('/learning/course')}
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600 hover:shadow-xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 active:shadow-inner active:translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Voltar ao Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Box Component
function StatBox({ label, value, color }) {
  return (
    <div className="bg-copilot-bg-primary border border-copilot-border-default rounded-copilot p-4">
      <div className={`w-8 h-8 ${color} rounded-full mx-auto mb-2`}></div>
      <div className="text-2xl font-bold text-copilot-text-primary mb-1">{value}</div>
      <div className="text-xs text-copilot-text-secondary">{label}</div>
    </div>
  );
}
