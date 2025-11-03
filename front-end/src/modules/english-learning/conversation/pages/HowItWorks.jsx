import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const { t } = useTranslation(['videoCall', 'common']);

  return (
    <div className="bg-copilot-bg-primary min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-copilot flex items-center justify-center mb-6 mx-auto">
            <span className="text-white text-4xl">📹</span>
          </div>
          <h1 className="text-4xl font-bold text-copilot-text-primary mb-4">
            {t('howItWorks.title', 'Como Funciona o Sistema de Video Call')}
          </h1>
          <p className="text-xl text-copilot-text-secondary">
            {t('howItWorks.subtitle', 'Conecte-se com outros usuários para praticar inglês em conversas ao vivo')}
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/video-call" 
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
                  {t('howItWorks.overview.realTime.title', 'Conversas em Tempo Real')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.overview.realTime.description', 'Conecte-se instantaneamente com outros usuários para praticar inglês através de videochamadas em tempo real.')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.overview.matching.title', 'Sistema de Matching Inteligente')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.overview.matching.description', 'Nosso algoritmo conecta usuários com níveis similares de inglês para uma experiência de aprendizado equilibrada.')}
                </p>
              </div>
            </div>
          </section>

          {/* Available Sessions Section */}
          <section className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              {t('howItWorks.availableSessions.title', 'Sessões Disponíveis')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.availableSessions.periods.title', 'Sistema de Períodos')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.availableSessions.periods.description', 'O sistema de video call opera em períodos específicos ao longo do dia. Cada período tem um horário de início e fim definido:')}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🌅</span>
                      <h4 className="font-semibold text-copilot-text-primary">
                        {t('howItWorks.availableSessions.periods.morning', 'Sessões da Manhã')}
                      </h4>
                    </div>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.availableSessions.periods.morningDesc', 'Ex: 08:00-09:00, 09:30-10:30')}
                    </p>
                  </div>
                  <div className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🌙</span>
                      <h4 className="font-semibold text-copilot-text-primary">
                        {t('howItWorks.availableSessions.periods.evening', 'Sessões da Noite')}
                      </h4>
                    </div>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.availableSessions.periods.eveningDesc', 'Ex: 19:00-20:00, 20:30-21:30')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.availableSessions.status.title', 'Status do Sistema')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.availableSessions.status.description', 'O dashboard mostra o status atual do sistema com um banner informativo no topo:')}
                </p>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">✅</span>
                      <h4 className="font-semibold text-green-700">
                        {t('howItWorks.availableSessions.status.active', 'Sistema Ativo')}
                      </h4>
                    </div>
                    <p className="text-sm text-green-600">
                      {t('howItWorks.availableSessions.status.activeDesc', 'Quando há uma sessão em andamento, você pode iniciar uma conversa imediatamente.')}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">⏳</span>
                      <h4 className="font-semibold text-yellow-700">
                        {t('howItWorks.availableSessions.status.waiting', 'Aguardando Próxima Sessão')}
                      </h4>
                    </div>
                    <p className="text-sm text-yellow-600">
                      {t('howItWorks.availableSessions.status.waitingDesc', 'Entre sessões, um countdown mostra o tempo restante até a próxima sessão disponível.')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.availableSessions.viewing.title', 'Visualização de Períodos')}
                </h3>
                <p className="text-copilot-text-secondary mb-3">
                  {t('howItWorks.availableSessions.viewing.description', 'No dashboard, você verá:')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-copilot-text-secondary ml-4">
                  <li>{t('howItWorks.availableSessions.viewing.current', 'A sessão atual em destaque (se houver uma ativa)')}</li>
                  <li>{t('howItWorks.availableSessions.viewing.next', 'A próxima sessão disponível (se não houver sessão ativa)')}</li>
                  <li>{t('howItWorks.availableSessions.viewing.expandButton', 'Botão "Ver todas" para expandir e ver todos os períodos do dia')}</li>
                </ul>
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
                    {t('howItWorks.gettingStarted.step1.title', 'Verifique os Períodos Disponíveis')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step1.description', 'No dashboard, confira o status do sistema e os horários das sessões. Certifique-se de que há uma sessão ativa ou aguarde a próxima.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                    {t('howItWorks.gettingStarted.step2.title', 'Escolha uma Opção')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step2.description', 'Você pode escolher entre encontrar um parceiro automaticamente, criar uma sala privada, ou entrar em uma sala existente com um ID.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                    {t('howItWorks.gettingStarted.step3.title', 'Aguarde na Fila (se necessário)')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step3.description', 'Se escolheu "Find a Partner", você entrará na fila de espera. O sistema mostrará um countdown e tentará encontrar um parceiro compatível.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-copilot-text-primary mb-2">
                    {t('howItWorks.gettingStarted.step4.title', 'Conecte-se e Pratique')}
                  </h3>
                  <p className="text-copilot-text-secondary">
                    {t('howItWorks.gettingStarted.step4.description', 'Quando um parceiro for encontrado ou você entrar em uma sala, será redirecionado para a videochamada para começar a conversar em inglês.')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span>
              {t('howItWorks.features.title', 'Recursos Disponíveis')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-copilot">
                  <span className="text-2xl">🎥</span>
                  <div>
                    <h3 className="font-semibold text-green-700">
                      {t('howItWorks.features.video.title', 'Video em Alta Qualidade')}
                    </h3>
                    <p className="text-sm text-green-600">
                      {t('howItWorks.features.video.description', 'Transmissão de video em HD para uma experiência clara e nítida')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-copilot">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <h3 className="font-semibold text-blue-700">
                      {t('howItWorks.features.audio.title', 'Áudio Cristalino')}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {t('howItWorks.features.audio.description', 'Qualidade de áudio otimizada para conversas claras')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-copilot">
                  <span className="text-2xl">🔇</span>
                  <div>
                    <h3 className="font-semibold text-purple-700">
                      {t('howItWorks.features.controls.title', 'Controles de Mídia')}
                    </h3>
                    <p className="text-sm text-purple-600">
                      {t('howItWorks.features.controls.description', 'Mute/unmute de áudio e video conforme necessário')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-copilot">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <h3 className="font-semibold text-orange-700">
                      {t('howItWorks.features.timer.title', 'Timer de Sessão')}
                    </h3>
                    <p className="text-sm text-orange-600">
                      {t('howItWorks.features.timer.description', 'Controle de tempo para sessões estruturadas de prática')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Matching System Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              {t('howItWorks.matchingSystem.title', 'Sistema de Matching e Fila de Espera')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.matchingSystem.howItWorks.title', 'Como Funciona o Matching')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.matchingSystem.howItWorks.description', 'Nosso sistema de matching considera vários fatores para conectar usuários compatíveis:')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-copilot-text-secondary ml-4">
                  <li>{t('howItWorks.matchingSystem.factors.level', 'Nível de inglês similar')}</li>
                  <li>{t('howItWorks.matchingSystem.factors.availability', 'Disponibilidade no momento')}</li>
                  <li>{t('howItWorks.matchingSystem.factors.preferences', 'Preferências de conversa')}</li>
                  <li>{t('howItWorks.matchingSystem.factors.timezone', 'Fuso horário compatível')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.matchingSystem.queue.title', 'Fila de Espera')}
                </h3>
                <p className="text-copilot-text-secondary mb-4">
                  {t('howItWorks.matchingSystem.queue.description', 'Quando você clica em "Find a Partner", entra em uma fila de espera inteligente:')}
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⏱️</span>
                      <h4 className="font-semibold text-blue-700">
                        {t('howItWorks.matchingSystem.queue.countdown.title', 'Countdown Timer')}
                      </h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      {t('howItWorks.matchingSystem.queue.countdown.description', 'Um timer em tempo real mostra quanto tempo você está esperando na fila. O sistema continua procurando um parceiro durante esse período.')}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔄</span>
                      <h4 className="font-semibold text-purple-700">
                        {t('howItWorks.matchingSystem.queue.realtime.title', 'Atualização em Tempo Real')}
                      </h4>
                    </div>
                    <p className="text-sm text-purple-600">
                      {t('howItWorks.matchingSystem.queue.realtime.description', 'A página da fila atualiza automaticamente quando um parceiro é encontrado, redirecionando você instantaneamente para a sala de video call.')}
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-copilot p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">❌</span>
                      <h4 className="font-semibold text-orange-700">
                        {t('howItWorks.matchingSystem.queue.cancel.title', 'Cancelar a Qualquer Momento')}
                      </h4>
                    </div>
                    <p className="text-sm text-orange-600">
                      {t('howItWorks.matchingSystem.queue.cancel.description', 'Você pode sair da fila a qualquer momento clicando no botão "Cancelar" e retornar ao dashboard.')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.matchingSystem.waiting.title', 'Tempo de Espera')}
                </h3>
                <p className="text-copilot-text-secondary mb-3">
                  {t('howItWorks.matchingSystem.waiting.description', 'O tempo de espera varia dependendo de:')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-copilot-text-secondary ml-4">
                  <li>{t('howItWorks.matchingSystem.waiting.factor1', 'Número de usuários online no momento')}</li>
                  <li>{t('howItWorks.matchingSystem.waiting.factor2', 'Horário do dia (períodos de pico têm mais usuários)')}</li>
                  <li>{t('howItWorks.matchingSystem.waiting.factor3', 'Compatibilidade de perfis disponíveis')}</li>
                </ul>
                <p className="text-copilot-text-secondary mt-3 text-sm italic">
                  {t('howItWorks.matchingSystem.waiting.tip', '💡 Dica: Períodos da noite geralmente têm mais usuários disponíveis.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-copilot-text-primary mb-3">
                  {t('howItWorks.matchingSystem.limits.title', 'Limites de Uso')}
                </h3>
                <p className="text-copilot-text-secondary mb-3">
                  {t('howItWorks.matchingSystem.limits.description', 'Para garantir disponibilidade justa para todos os usuários, o sistema pode ter limites de uso:')}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-copilot p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⚠️</span>
                    <h4 className="font-semibold text-red-700">
                      {t('howItWorks.matchingSystem.limits.usage.title', 'Limite de Uso Atingido')}
                    </h4>
                  </div>
                  <p className="text-sm text-red-600 mb-2">
                    {t('howItWorks.matchingSystem.limits.usage.description', 'Se você atingir o limite de uso, o botão "Find a Partner" ficará desabilitado temporariamente. Uma mensagem explicativa será exibida no dashboard.')}
                  </p>
                  <p className="text-xs text-red-500 italic">
                    {t('howItWorks.matchingSystem.limits.usage.note', 'Nota: Salas privadas (Create Room e Join Room) não são afetadas por limites de uso.')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices Section */}
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              {t('howItWorks.bestPractices.title', 'Dicas para Melhor Experiência')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.bestPractices.prepare.title', 'Prepare-se Antes')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.bestPractices.prepare.description', 'Tenha tópicos de conversa em mente e certifique-se de que seu ambiente está adequado')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="text-2xl">🔊</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.bestPractices.audio.title', 'Teste seu Áudio')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.bestPractices.audio.description', 'Verifique se seu microfone e fones de ouvido estão funcionando antes de iniciar')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">😊</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.bestPractices.polite.title', 'Seja Respeitoso')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.bestPractices.polite.description', 'Mantenha um tom amigável e respeitoso durante toda a conversa')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h3 className="font-semibold text-copilot-text-primary mb-1">
                      {t('howItWorks.bestPractices.time.title', 'Respeite o Tempo')}
                    </h3>
                    <p className="text-sm text-copilot-text-secondary">
                      {t('howItWorks.bestPractices.time.description', 'Seja pontual e respeite o tempo combinado para a sessão')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              {t('howItWorks.troubleshooting.title', 'Solução de Problemas')}
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-400 pl-4">
                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {t('howItWorks.troubleshooting.noVideo.title', 'Problemas de Video')}
                </h3>
                <p className="text-sm text-copilot-text-secondary">
                  {t('howItWorks.troubleshooting.noVideo.description', 'Verifique se sua câmera está conectada e as permissões estão habilitadas no navegador')}
                </p>
              </div>
              
              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {t('howItWorks.troubleshooting.noAudio.title', 'Problemas de Áudio')}
                </h3>
                <p className="text-sm text-copilot-text-secondary">
                  {t('howItWorks.troubleshooting.noAudio.description', 'Teste seu microfone nas configurações do navegador e verifique se não está mutado')}
                </p>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-copilot-text-primary mb-2">
                  {t('howItWorks.troubleshooting.connection.title', 'Problemas de Conexão')}
                </h3>
                <p className="text-sm text-copilot-text-secondary">
                  {t('howItWorks.troubleshooting.connection.description', 'Verifique sua conexão com a internet e tente recarregar a página')}
                </p>
              </div>
            </div>
          </section>

          {/* Dashboard Features Section */}
          <section className="bg-copilot-bg-secondary border border-copilot-border-default rounded-copilot p-8">
            <h2 className="text-2xl font-bold text-copilot-text-primary mb-6 flex items-center gap-3">
              <span className="text-3xl">🎛️</span>
              {t('howItWorks.dashboardFeatures.title', 'Funcionalidades do Dashboard')}
            </h2>
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-copilot p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-copilot flex items-center justify-center">
                      <span className="text-white text-2xl">🚀</span>
                    </div>
                    <h3 className="text-lg font-semibold text-green-700">
                      {t('howItWorks.dashboardFeatures.startNewCall.title', 'Start New Call')}
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 mb-4">
                    {t('howItWorks.dashboardFeatures.startNewCall.description', 'Inicia o processo de matching automático para encontrar um parceiro de conversação.')}
                  </p>
                  <div className="space-y-2 text-xs text-green-600">
                    <p><strong>{t('howItWorks.dashboardFeatures.howItWorks', 'Como funciona:')}</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('howItWorks.dashboardFeatures.startNewCall.step1', 'Clique em "Find a Partner"')}</li>
                      <li>{t('howItWorks.dashboardFeatures.startNewCall.step2', 'Sistema encontra usuário compatível')}</li>
                      <li>{t('howItWorks.dashboardFeatures.startNewCall.step3', 'Redireciona para sala de video call')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-copilot p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-copilot flex items-center justify-center">
                      <span className="text-white text-2xl">🏠</span>
                    </div>
                    <h3 className="text-lg font-semibold text-purple-700">
                      {t('howItWorks.dashboardFeatures.createRoom.title', 'Create Room')}
                    </h3>
                  </div>
                  <p className="text-sm text-purple-600 mb-4">
                    {t('howItWorks.dashboardFeatures.createRoom.description', 'Cria uma sala privada com ID único que você pode compartilhar com amigos.')}
                  </p>
                  <div className="space-y-2 text-xs text-purple-600">
                    <p><strong>{t('howItWorks.dashboardFeatures.howItWorks', 'Como funciona:')}</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('howItWorks.dashboardFeatures.createRoom.step1', 'Clique em "Create Room"')}</li>
                      <li>{t('howItWorks.dashboardFeatures.createRoom.step2', 'Sistema gera ID único da sala')}</li>
                      <li>{t('howItWorks.dashboardFeatures.createRoom.step3', 'Compartilhe o ID com seus amigos')}</li>
                      <li>{t('howItWorks.dashboardFeatures.createRoom.step4', 'Aguarde eles entrarem na sala')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-copilot p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-copilot flex items-center justify-center">
                      <span className="text-white text-2xl">🔑</span>
                    </div>
                    <h3 className="text-lg font-semibold text-orange-700">
                      {t('howItWorks.dashboardFeatures.joinRoom.title', 'Join with Room ID')}
                    </h3>
                  </div>
                  <p className="text-sm text-orange-600 mb-4">
                    {t('howItWorks.dashboardFeatures.joinRoom.description', 'Entre em uma sala existente usando o ID fornecido por um amigo.')}
                  </p>
                  <div className="space-y-2 text-xs text-orange-600">
                    <p><strong>{t('howItWorks.dashboardFeatures.howItWorks', 'Como funciona:')}</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t('howItWorks.dashboardFeatures.joinRoom.step1', 'Cole o ID da sala no campo')}</li>
                      <li>{t('howItWorks.dashboardFeatures.joinRoom.step2', 'Clique em "Join with Room ID"')}</li>
                      <li>{t('howItWorks.dashboardFeatures.joinRoom.step3', 'Sistema conecta você à sala')}</li>
                      <li>{t('howItWorks.dashboardFeatures.joinRoom.step4', 'Inicie a conversa com os participantes')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-copilot p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  💡 {t('howItWorks.dashboardFeatures.tips.title', 'Dicas Importantes')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <h4 className="font-semibold mb-2">{t('howItWorks.dashboardFeatures.tips.startNewCall.title', 'Start New Call:')}</h4>
                    <ul className="space-y-1">
                      <li>• {t('howItWorks.dashboardFeatures.tips.startNewCall.tip1', 'Ideal para conhecer novas pessoas')}</li>
                      <li>• {t('howItWorks.dashboardFeatures.tips.startNewCall.tip2', 'Sistema encontra parceiro automaticamente')}</li>
                      <li>• {t('howItWorks.dashboardFeatures.tips.startNewCall.tip3', 'Pode demorar alguns minutos')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('howItWorks.dashboardFeatures.tips.privateRooms.title', 'Salas Privadas:')}</h4>
                    <ul className="space-y-1">
                      <li>• {t('howItWorks.dashboardFeatures.tips.privateRooms.tip1', 'Perfeito para estudar com amigos')}</li>
                      <li>• {t('howItWorks.dashboardFeatures.tips.privateRooms.tip2', 'Controle total sobre quem participa')}</li>
                      <li>• {t('howItWorks.dashboardFeatures.tips.privateRooms.tip3', 'ID da sala é único e seguro')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              to="/video-call"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-copilot font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              <span>📹</span>
              {t('howItWorks.startVideoCall', 'Iniciar Video Call Agora')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
