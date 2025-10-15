import { useEffect, useState } from 'react';

export default function Card({ 
  question, 
  onDifficultySubmit, 
  isLastCard = false,
  onComplete 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [speechRate, setSpeechRate] = useState(0.75); // Velocidade padrão
  const [showSpeedControls, setShowSpeedControls] = useState(false);

  // Carregar vozes disponíveis quando o componente monta
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Carregar vozes imediatamente
    loadVoices();

    // Carregar vozes quando elas estiverem disponíveis (alguns navegadores carregam assincronamente)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const speakText = (text, language = 'en-US') => {
    if ('speechSynthesis' in window) {
      // Parar qualquer fala em andamento
      speechSynthesis.cancel();
      
      // Aguardar um pouco para garantir que o cancelamento foi processado
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        
        // Configurações otimizadas para melhor qualidade
        utterance.rate = speechRate; // Usar velocidade configurável pelo usuário
        utterance.pitch = 1.1; // Tom ligeiramente mais alto para clareza
        utterance.volume = 0.9; // Volume mais alto para melhor audibilidade
        
        // Configurações específicas baseadas no tipo de texto (aplicar multiplicadores)
        if (text.includes('?')) {
          // Para perguntas, usar tom mais alto e velocidade um pouco mais lenta
          utterance.pitch = 1.2;
          utterance.rate = speechRate * 0.9; // 10% mais lento que a configuração
        } else if (text.includes('!')) {
          // Para exclamações, usar tom mais alto
          utterance.pitch = 1.3;
          utterance.rate = speechRate; // Velocidade normal
        } else if (text.length > 50) {
          // Para textos longos, usar velocidade um pouco mais rápida
          utterance.rate = speechRate * 1.1; // 10% mais rápido que a configuração
        }
        
        // Tentar selecionar a melhor voz disponível
        let selectedVoice = null;
        
        if (voices.length > 0) {
          const languageCode = language.split('-')[0];
          
          // Priorizar vozes por qualidade e compatibilidade
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith(languageCode) && 
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Amazon'))
          ) || voices.find(voice => 
            voice.lang.startsWith(languageCode) && 
            voice.default
          ) || voices.find(voice => 
            voice.lang.startsWith(languageCode)
          ) || voices.find(voice => 
            voice.default
          ) || voices[0]; // Fallback para primeira voz disponível
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            // console.log('Selected voice:', selectedVoice.name, 'for language:', language);
          }
        }
        
        // Eventos para controle de estado
        utterance.onstart = () => {
          setIsSpeaking(true);
          // console.log('Audio started:', selectedVoice?.name || 'Default voice');
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          // console.log('Audio ended');
        };
        
        utterance.onerror = (event) => {
          setIsSpeaking(false);
          console.error('Audio error:', event.error);
        };
        
        // Configurações adicionais para melhor qualidade
        utterance.preservePitch = true; // Manter tom natural
        utterance.preserveRate = true; // Manter velocidade natural
        
        speechSynthesis.speak(utterance);
      }, 100);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  const handleSpeak = (e) => {
    e.stopPropagation(); // Evitar que o flip seja acionado
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (isFlipped) {
        // Falar português
        speakText(question.backText, 'pt-BR');
      } else {
        // Falar inglês
        speakText(question.frontText, 'en-US');
      }
    }
  };

  const handleSpeedChange = (newRate) => {
    setSpeechRate(newRate);
    // Se estiver falando, parar e reiniciar com nova velocidade
    if (isSpeaking) {
      speechSynthesis.cancel();
      setTimeout(() => {
        if (isFlipped) {
          speakText(question.backText, 'pt-BR');
        } else {
          speakText(question.frontText, 'en-US');
        }
      }, 100);
    }
  };

  const toggleSpeedControls = (e) => {
    e.stopPropagation();
    setShowSpeedControls(!showSpeedControls);
  };

  const handleDifficultySubmit = async (difficulty) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onDifficultySubmit(question.id, difficulty);
      
      // Reset card to front for next card
      setIsFlipped(false);
      
      if (isLastCard) {
        onComplete?.();
      }
    } catch (error) {
      console.error('Error submitting difficulty:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
        <style jsx>{`
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

          /* Custom slider styles */
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider::-webkit-slider-track {
            height: 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
          }

          .slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
          }
        `}</style>
      
      {/* Card */}
      <div 
        className={`card-container relative w-full h-48 cursor-pointer ${
          isFlipped ? 'flipped' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <div className="card-face card-front">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot-lg shadow-copilot-xl h-full flex items-center justify-center p-6 relative">
            <div className="text-center text-white">
              <p className="text-lg leading-relaxed px-2">
                {question.frontText}
              </p>
              <div className="mt-4 text-sm opacity-80">
                Click to flip card
              </div>
            </div>
            {/* Audio controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Speed control button */}
              <button
                onClick={toggleSpeedControls}
                className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                title="Speed control"
              >
                <span className="text-white text-sm group-hover:scale-110 transition-transform duration-200">⚡</span>
              </button>
              
              {/* Audio button */}
              <button
                onClick={handleSpeak}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                title={`Play audio ${isSpeaking ? '(click to stop)' : '(high quality TTS)'}`}
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

        {/* Back of card */}
        <div className="card-face card-back">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-copilot-lg shadow-copilot-xl h-full flex items-center justify-center p-6 relative">
            <div className="text-center text-white">
              <p className="text-lg leading-relaxed px-2">
                {question.backText}
              </p>
              <div className="mt-4 text-sm opacity-80">
                Click to flip card
              </div>
            </div>
            {/* Audio controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              {/* Speed control button */}
              <button
                onClick={toggleSpeedControls}
                className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                title="Speed control"
              >
                <span className="text-white text-sm group-hover:scale-110 transition-transform duration-200">⚡</span>
              </button>
              
              {/* Audio button */}
              <button
                onClick={handleSpeak}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                title={`Play audio ${isSpeaking ? '(click to stop)' : '(high quality TTS)'}`}
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

      {/* Speed controls panel */}
      {showSpeedControls && (
        <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-copilot backdrop-blur-sm">
          <div className="text-center text-white mb-3">
            <h4 className="text-sm font-semibold mb-2">Velocidade do Áudio</h4>
            <div className="text-xs opacity-80">
              Atual: {Math.round(speechRate * 100)}% 
              {speechRate < 0.6 && ' (Muito lento)'}
              {speechRate >= 0.6 && speechRate < 0.8 && ' (Lento)'}
              {speechRate >= 0.8 && speechRate < 1.2 && ' (Normal)'}
              {speechRate >= 1.2 && speechRate < 1.5 && ' (Rápido)'}
              {speechRate >= 1.5 && ' (Muito rápido)'}
            </div>
          </div>
          
          {/* Speed slider */}
          <div className="mb-4">
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white bg-opacity-20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(speechRate - 0.3) / 1.7 * 100}%, rgba(255,255,255,0.2) ${(speechRate - 0.3) / 1.7 * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
          
          {/* Preset buttons */}
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={() => handleSpeedChange(0.5)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                speechRate === 0.5 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Muito Lento
            </button>
            <button
              onClick={() => handleSpeedChange(0.75)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                speechRate === 0.75 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Lento
            </button>
            <button
              onClick={() => handleSpeedChange(1.0)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                speechRate === 1.0 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleSpeedChange(1.5)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                speechRate === 1.5 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Rápido
            </button>
          </div>
          
          {/* Close button */}
          <div className="text-center">
            <button
              onClick={() => setShowSpeedControls(false)}
              className="text-white text-xs opacity-70 hover:opacity-100 transition-opacity duration-200"
            >
              Fechar controles
            </button>
          </div>
        </div>
      )}

      {/* Difficulty buttons - only show when flipped */}
      {isFlipped && (
        <div className="mt-6 space-y-4">
          <h4 className="text-center text-copilot-text-primary font-semibold mb-4">
            How difficult was this card?
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDifficultySubmit('again')}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 disabled:cursor-not-allowed flex flex-col items-center"
            >
              <span className="font-bold">Again</span>
              <span className="text-xs opacity-90">1 min</span>
            </button>
            
            <button
              onClick={() => handleDifficultySubmit('hard')}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 disabled:cursor-not-allowed flex flex-col items-center"
            >
              <span className="font-bold">Hard</span>
              <span className="text-xs opacity-90">10 min</span>
            </button>
            
            <button
              onClick={() => handleDifficultySubmit('good')}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 disabled:cursor-not-allowed flex flex-col items-center"
            >
              <span className="font-bold">Good</span>
              <span className="text-xs opacity-90">4 days</span>
            </button>
            
            <button
              onClick={() => handleDifficultySubmit('easy')}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded-copilot font-semibold transition-colors duration-200 disabled:cursor-not-allowed flex flex-col items-center"
            >
              <span className="font-bold">Easy</span>
              <span className="text-xs opacity-90">7 days</span>
            </button>
          </div>


          {isSubmitting && (
            <div className="text-center text-copilot-text-secondary text-sm">
              Processing...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
