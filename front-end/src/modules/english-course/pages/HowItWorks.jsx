import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot flex items-center justify-center mb-6 mx-auto">
            <span className="text-white text-4xl">📚</span>
          </div>
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-4">
            {t('howItWorks.title', 'Como Funciona o Sistema de Aprendizado')}
          </h1>
          <p className="text-xl text-copilot-text-secondary">
            {t('howItWorks.subtitle', 'Entenda como aproveitar ao máximo sua jornada de aprendizado de inglês')}
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/english-course" 
            className="inline-flex items-center gap-2 text-copilot-text-secondary hover:text-copilot-text-primary transition-colors"
          >
            <span>←</span>
            {t('howItWorks.backToDashboard', 'Voltar ao Dashboard')}
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Overview Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              {t('howItWorks.overview.title', 'Visão Geral do Sistema')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.overview.spacedRepetition.title', 'Repetição Espaçada')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.overview.spacedRepetition.description', 'Nosso sistema usa técnicas de repetição espaçada para otimizar seu aprendizado. As cartas aparecem nos momentos ideais para maximizar a retenção.')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.overview.levels.title', 'Níveis Progressivos')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.overview.levels.description', 'Comece no nível Beginner e avance gradualmente para Elementary, Intermediate e Advanced. Cada nível desbloqueia após completar o anterior.')}
                </p>
              </div>
            </div>
          </section>

          {/* How to Start Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              {t('howItWorks.gettingStarted.title', 'Como Começar')}
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                    {t('howItWorks.gettingStarted.step1.title', 'Escolha uma Lição')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step1.description', 'No dashboard, clique em uma lição do nível Beginner para começar. As lições são desbloqueadas sequencialmente.')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                    {t('howItWorks.gettingStarted.step2.title', 'Pratique as Cartas')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step2.description', 'Veja a pergunta na frente da carta, pense na resposta, e clique para revelar. Avalie sua dificuldade usando os botões: Again, Hard, Good, Easy.')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                    {t('howItWorks.gettingStarted.step3.title', 'Complete a Lição')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step3.description', 'Após praticar todas as cartas da lição, ela será marcada como completada e as cartas entrarão no sistema de revisão.')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Difficulty Buttons Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              {t('howItWorks.difficultyButtons.title', 'Botões de Dificuldade')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-copilot">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <h3 className="font-semibold text-red-700">
                      {t('howItWorks.difficultyButtons.again.title', 'Again (Novamente)')}
                    </h3>
                    <p className="text-sm text-red-600">
                      {t('howItWorks.difficultyButtons.again.description', 'Não soube a resposta. Aparece em 1 minuto.')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-copilot">
                  <span className="text-2xl">🟠</span>
                  <div>
                    <h3 className="font-semibold text-orange-700">
                      {t('howItWorks.difficultyButtons.hard.title', 'Hard (Difícil)')}
                    </h3>
                    <p className="text-sm text-orange-600">
                      {t('howItWorks.difficultyButtons.hard.description', 'Soube, mas foi difícil. Aparece em 6 minutos.')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-copilot">
                  <span className="text-2xl">🟢</span>
                  <div>
                    <h3 className="font-semibold text-green-700">
                      {t('howItWorks.difficultyButtons.good.title', 'Good (Bom)')}
                    </h3>
                    <p className="text-sm text-green-600">
                      {t('howItWorks.difficultyButtons.good.description', 'Soube bem. Aparece em 10 minutos (primeira vez) ou 1 dia (segunda vez).')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-copilot">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <h3 className="font-semibold text-blue-700">
                      {t('howItWorks.difficultyButtons.easy.title', 'Easy (Fácil)')}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {t('howItWorks.difficultyButtons.easy.description', 'Muito fácil. Aparece em 3 dias.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Review System Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">🔄</span>
              {t('howItWorks.reviewSystem.title', 'Sistema de Revisão')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.reviewSystem.howItWorks.title', 'Como Funciona')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.reviewSystem.howItWorks.description', 'Após completar uma lição, as cartas entram no sistema de revisão. O algoritmo calcula quando cada carta deve aparecer novamente baseado na sua dificuldade.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.reviewSystem.intervals.title', 'Intervalos de Revisão')}
                </h3>
                <div className="bg-copilot-bg-primary border border-copilot-border-default rounded-copilot p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-copilot-text-primary">Primeira revisão:</strong>
                      <ul className="mt-2 space-y-1 text-copilot-text-secondary">
                        <li>• Again: 1 minuto</li>
                        <li>• Hard: 6 minutos</li>
                        <li>• Good: 10 minutos</li>
                        <li>• Easy: 3 dias</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-copilot-text-primary">Revisões subsequentes:</strong>
                      <ul className="mt-2 space-y-1 text-copilot-text-secondary">
                        <li>• Again: 1 minuto</li>
                        <li>• Hard: 6 minutos</li>
                        <li>• Good: Intervalo anterior × Fator de facilidade</li>
                        <li>• Easy: 3 dias</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Progress Tracking Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              {t('howItWorks.progressTracking.title', 'Acompanhamento de Progresso')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-copilot flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {t('howItWorks.progressTracking.accuracy.title', 'Precisão')}
                </h3>
                <p className="text-sm text-copilot-text-secondary">
                  {t('howItWorks.progressTracking.accuracy.description', 'Acompanhe quantas respostas você acertou')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-copilot flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {t('howItWorks.progressTracking.lessons.title', 'Lições Completadas')}
                </h3>
                <p className="text-sm text-copilot-text-secondary">
                  {t('howItWorks.progressTracking.lessons.description', 'Veja quantas lições você finalizou')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-copilot flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {t('howItWorks.progressTracking.reviews.title', 'Revisões Pendentes')}
                </h3>
                <p className="text-sm text-copilot-text-secondary">
                  {t('howItWorks.progressTracking.reviews.description', 'Quantas cartas estão prontas para revisão')}
                </p>
              </div>
            </div>
          </section>

          {/* Tips Section */}
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              {t('howItWorks.tips.title', 'Dicas para Melhor Aproveitamento')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.tips.consistency.title', 'Seja Consistente')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.tips.consistency.description', 'Pratique um pouco todos os dias em vez de muito de uma vez')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="text-2xl">🤔</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.tips.honest.title', 'Seja Honesto')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.tips.honest.description', 'Avalie corretamente sua dificuldade para otimizar o sistema')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.tips.timing.title', 'Respeite os Intervalos')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.tips.timing.description', 'Não force revisões antes do tempo - o sistema é otimizado')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.tips.review.title', 'Revise Regularmente')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.tips.review.description', 'Use o botão "Review All Lessons" para revisar cartas devidas')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              to="/english-course"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-copilot font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              <span>🚀</span>
              {t('howItWorks.startLearning', 'Começar a Aprender Agora')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
