import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../auth-social/context/AuthContext';

const Matching = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['videoCall']);
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState('random');

  const topics = [
    { id: 'random', name: t('matching.topics.random'), icon: '🎲' },
    { id: 'travel', name: t('matching.topics.travel'), icon: '✈️' },
    { id: 'food', name: t('matching.topics.food'), icon: '🍕' },
    { id: 'technology', name: t('matching.topics.technology'), icon: '💻' },
    { id: 'sports', name: t('matching.topics.sports'), icon: '⚽' },
    { id: 'music', name: t('matching.topics.music'), icon: '🎵' },
    { id: 'books', name: t('matching.topics.books'), icon: '📚' },
    { id: 'career', name: t('matching.topics.career'), icon: '💼' },
  ];

  const randomTopics = [
    t('matching.randomQuestions.q1'),
    t('matching.randomQuestions.q2'),
    t('matching.randomQuestions.q3'),
    t('matching.randomQuestions.q4'),
    t('matching.randomQuestions.q5'),
    t('matching.randomQuestions.q6'),
    t('matching.randomQuestions.q7'),
    t('matching.randomQuestions.q8'),
    t('matching.randomQuestions.q9'),
    t('matching.randomQuestions.q10'),
    t('matching.randomQuestions.q11'),
    t('matching.randomQuestions.q12'),
    t('matching.randomQuestions.q13'),
    t('matching.randomQuestions.q14'),
    t('matching.randomQuestions.q15'),
    t('matching.randomQuestions.q16'),
    t('matching.randomQuestions.q17'),
    t('matching.randomQuestions.q18'),
    t('matching.randomQuestions.q19'),
    t('matching.randomQuestions.q20'),
  ];

  useEffect(() => {
    let interval;
    if (isMatching) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatching]);

  const startMatching = async () => {
    setIsMatching(true);
    setTimeElapsed(0);
    
    // Simulate matching process
    // In real implementation, this would connect to a matching service
    setTimeout(() => {
      // Simulate finding a match
      const names = [
        'Jordan Smith', 'Taylor Lee', 'Casey Miller', 'Riley Davis', 'Morgan Brown',
        'Jamie Wilson', 'Avery Clark', 'Cameron Lewis', 'Dakota Walker', 'Reese Hall'
      ];
      // In mock mode we don't know the real country; avoid misleading info
      const levels = ['beginner', 'intermediate', 'advanced'];
      const interestsPool = ['travel', 'music', 'technology', 'food', 'books', 'sports', 'career'];

      const mockMatchedUser = {
        id: `mock-user-${Math.random().toString(36).slice(2, 8)}`,
        name: names[Math.floor(Math.random() * names.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        country: null,
        interests: interestsPool.sort(() => 0.5 - Math.random()).slice(0, 3)
      };
      
      setMatchedUser(mockMatchedUser);
      setMatchFound(true);
      setIsMatching(false);
      
      // Generate room name
      const roomId = Math.random().toString(36).substring(2, 15);
      setRoomName(`scalex-${roomId}`);
    }, Math.random() * 10000 + 5000); // 5-15 seconds
  };

  const stopMatching = () => {
    setIsMatching(false);
    setTimeElapsed(0);
  };

  const startCall = () => {
    if (roomName) {
      navigate(`/video-call/room/${roomName}`, { 
        state: { 
          matchedUser, 
          topic: selectedTopic,
          randomTopic: randomTopics[Math.floor(Math.random() * randomTopics.length)]
        }
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-3">
            {t('matching.title')}
          </h1>
          <p className="text-copilot-text-secondary text-lg">
            {t('matching.subtitle')}
          </p>
        </div>

        {!matchFound ? (
          <div className="space-y-8">
            {/* Topic Selection */}
            <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-6">
              <h3 className="text-lg font-semibold text-copilot-text-primary mb-4">
                {t('matching.chooseTopicTitle')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    disabled={isMatching}
                    className={`p-3 rounded-copilot border transition-all duration-200 ${
                      selectedTopic === topic.id
                        ? 'border-copilot-accent-primary bg-copilot-accent-primary bg-opacity-10'
                        : 'border-copilot-border-default hover:border-copilot-accent-primary'
                    } ${isMatching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-2xl mb-2">{topic.icon}</div>
                    <div className="text-sm font-medium text-copilot-text-primary">
                      {topic.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Matching Status */}
            {isMatching ? (
              <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white border-t-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold text-copilot-text-primary mb-2">
                  {t('matching.findingPartner')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('matching.lookingForSomeone', { topic: topics.find(t => t.id === selectedTopic)?.name.toLowerCase() })}
                </p>
                <div className="text-3xl font-mono text-copilot-accent-primary mb-6">
                  {formatTime(timeElapsed)}
                </div>
                <button
                  onClick={stopMatching}
                  className="btn-copilot-secondary"
                >
                  {t('matching.cancelSearch')}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={startMatching}
                  className="btn-copilot-primary text-lg px-8 py-4"
                >
                  {t('matching.startLooking')}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Match Found */
          <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-copilot-text-primary mb-2">
              {t('matching.matchFound')}
            </h3>
            <p className="text-copilot-text-secondary mb-6">
              {t('matching.matchedWith')} <strong>{matchedUser.name}</strong>
            </p>

            <div className="bg-copilot-bg-primary rounded-copilot p-4 mb-6">
              <div className="flex items-center justify-center gap-4 text-sm text-copilot-text-secondary">
                <span>🌍 {t('matching.online')}</span>
                <span>📊 {matchedUser.level}</span>
                <span>⏱️ {formatTime(timeElapsed)} {t('matching.searchTime')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startCall}
                className="btn-copilot-primary text-lg px-8 py-4 w-full"
              >
                {t('matching.startVideoCall')}
              </button>
              <button
                onClick={() => {
                  setMatchFound(false);
                  setMatchedUser(null);
                  setRoomName(null);
                }}
                className="btn-copilot-secondary w-full"
              >
                {t('matching.findAnotherPartner')}
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-copilot p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">
            💡 {t('matching.tipsTitle')}
          </h4>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• {t('matching.tip1')}</li>
            <li>• {t('matching.tip2')}</li>
            <li>• {t('matching.tip3')}</li>
            <li>• {t('matching.tip4')}</li>
            <li>• {t('matching.tip5')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Matching;
